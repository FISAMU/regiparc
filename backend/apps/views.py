"""
Vues API RegiParc (Django REST Framework).

Organisation du fichier :
  1. Auth (login / logout) + reset mot de passe
  2. Dashboard & lookups
  3. Utilisateurs admin (liste / détail / me / heartbeat)
  4. Recherche & notifications
  5. CRUD métier (affectations, catégories, employés, …)

Permissions typiques : IsAdminUser pour le métier, règles superuser
pour la gestion des comptes.
"""
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.db import connection
from django.db.models import Q, Sum, Count
from collections import Counter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from .models import (
    Affectation,
    Categorie,
    Employe,
    Equipement,
    Maintenance,
    PasswordResetCode,
    Service,
)
from .serializers import (
    AffectationSerializer,
    CategorieSerializer,
    EmployeSerializer,
    EquipementSerializer,
    MaintenanceSerializer,
    ServiceSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    MeUpdateSerializer,
)
from .pagination import get_paginated_response, apply_search_filter
from .presence import touch_user_presence, clear_user_presence

User = get_user_model()


def _classify_maintenance_type(type_maintenance):
    normalized = type_maintenance.lower()
    if 'prévent' in normalized or 'prevent' in normalized:
        return 'preventive'
    if 'curatif' in normalized or 'curative' in normalized:
        return 'curative'
    if 'correct' in normalized:
        return 'corrective'
    return 'autre'


def _serialize_user(user):
    return UserSerializer(user).data


def _can_manage_target_user(actor, target):
    """Un admin non-superuser ne peut jamais gérer un superuser."""
    if target.is_superuser and not actor.is_superuser:
        return False
    return True


def _deny_manage_superuser():
    return Response(
        {
            'error': (
                "Vous ne pouvez pas modifier les informations "
                "d'un super administrateur."
            ),
        },
        status=status.HTTP_403_FORBIDDEN,
    )

# ============================================================
# Vue de connexion (login par email/mot de passe)
# ============================================================
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Veuillez fournir un email et un mot de passe.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        try:
            account = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Email ou mot de passe incorrect.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not account.is_active:
            return Response(
                {'error': 'Votre compte admin est désactivé.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = authenticate(username=account.username, password=password)
        if user is None:
            return Response(
                {'error': 'Email ou mot de passe incorrect.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_staff:
            return Response(
                {'error': "Vous n'êtes plus admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        profile = touch_user_presence(user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_online': True,
                'last_seen': profile.last_seen.isoformat() if profile.last_seen else None,
                'photo': profile.photo if profile.photo else None,
            },
        })


# ============================================================
# Déconnexion — invalide le token + présence
# ============================================================
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        clear_user_presence(request.user)
        Token.objects.filter(user=request.user).delete()
        return Response(
            {'message': 'Déconnexion réussie.', 'is_online': False},
            status=status.HTTP_200_OK,
        )


def _get_valid_reset_code(email, code):
    from django.conf import settings
    from django.utils import timezone
    from datetime import timedelta

    try:
        user = User.objects.get(email__iexact=email.strip())
    except User.DoesNotExist:
        return None, None

    expiry_minutes = getattr(settings, 'PASSWORD_RESET_CODE_EXPIRY_MINUTES', 15)
    cutoff = timezone.now() - timedelta(minutes=expiry_minutes)

    reset = (
        PasswordResetCode.objects.filter(
            user=user,
            code=code.strip(),
            is_used=False,
            created_at__gte=cutoff,
        )
        .order_by('-created_at')
        .first()
    )
    return user, reset


# ============================================================
# Reset MDP — étape 1 : envoi du code par email
# ============================================================
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        import random
        from django.conf import settings
        from apps.email_utils import send_password_reset_email

        email = (request.data.get('email') or '').strip()
        if not email:
            return Response(
                {'error': 'Veuillez fournir votre adresse email.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        generic_message = (
            'Si un compte est associé à cet email, un code de vérification '
            'vient d\'être envoyé.'
        )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'message': generic_message}, status=status.HTTP_200_OK)

        if not user.is_active:
            return Response(
                {'error': 'Votre compte admin est désactivé.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        code = f'{random.randint(0, 999999):06d}'
        PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
        PasswordResetCode.objects.create(user=user, code=code)

        expiry = getattr(settings, 'PASSWORD_RESET_CODE_EXPIRY_MINUTES', 15)

        try:
            send_password_reset_email(
                to_email=user.email,
                first_name=user.first_name or user.username,
                code=code,
                expiry_minutes=expiry,
            )
        except Exception as exc:
            import logging

            logging.getLogger(__name__).exception(
                'Échec envoi email reset password: %s', exc
            )
            return Response(
                {
                    'error': (
                        'Impossible d\'envoyer l\'email pour le moment. '
                        f'Détail: {exc}'
                    ),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({'message': generic_message}, status=status.HTTP_200_OK)


# ============================================================
# Reset MDP — étape 2 : vérification du code
# ============================================================
class PasswordResetVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        code = (request.data.get('code') or '').strip()

        if not email or not code:
            return Response(
                {'error': 'Email et code sont requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, reset = _get_valid_reset_code(email, code)
        if not user or not reset:
            return Response(
                {'error': 'Code de vérification invalide ou expiré.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {'message': 'Code vérifié. Vous pouvez choisir un nouveau mot de passe.'},
            status=status.HTTP_200_OK,
        )


# ============================================================
# Reset MDP — étape 3 : définition du nouveau mot de passe
# ============================================================
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        code = (request.data.get('code') or '').strip()
        password = request.data.get('password') or ''

        if not email or not code or not password:
            return Response(
                {'error': 'Email, code et nouveau mot de passe sont requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {'error': 'Le mot de passe doit contenir au moins 8 caractères.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, reset = _get_valid_reset_code(email, code)
        if not user or not reset:
            return Response(
                {'error': 'Code de vérification invalide ou expiré.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=['password'])
        reset.is_used = True
        reset.save(update_fields=['is_used'])
        Token.objects.filter(user=user).delete()

        return Response(
            {'message': 'Mot de passe modifié avec succès. Vous pouvez vous connecter.'},
            status=status.HTTP_200_OK,
        )


def _get_overview_counts():
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM apps_equipement),
                (SELECT COUNT(*) FROM apps_employe),
                (SELECT COUNT(*) FROM apps_maintenance),
                (SELECT COUNT(*) FROM apps_service),
                (SELECT COUNT(*) FROM apps_affectation),
                (SELECT COUNT(*) FROM apps_categorie)
            """,
        )
        return cursor.fetchone()


def _build_overview_payload():
    (
        equipements_count,
        employes_count,
        maintenance_total,
        services_count,
        affectations_count,
        categories_count,
    ) = _get_overview_counts()

    return {
        'equipements': {'value': equipements_count, 'growthRate': 0},
        'employes': {'value': employes_count, 'growthRate': 0},
        'maintenances': {'value': maintenance_total, 'growthRate': 0},
        'services': {'value': services_count, 'growthRate': 0},
        'affectations': {'value': affectations_count, 'growthRate': 0},
        'categories': {'value': categories_count, 'growthRate': 0},
    }


# ============================================================
# Dashboard — aperçu léger / stats complètes
# ============================================================
class DashboardOverviewView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_build_overview_payload(), status=status.HTTP_200_OK)


class DashboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        overview = _build_overview_payload()

        service_rows = list(
            Service.objects.annotate(
                affectations=Count('equipements__affectations', distinct=True),
                actives=Count(
                    'equipements__affectations',
                    filter=Q(equipements__affectations__dateRetour__isnull=True),
                    distinct=True,
                ),
                employes_count=Count(
                    'equipements__employe',
                    filter=Q(equipements__employe__isnull=False),
                    distinct=True,
                ),
            ).values(
                'idService',
                'nomService',
                'affectations',
                'actives',
                'employes_count',
            )
        )

        affectations_par_service = [
            {
                'service': row['nomService'],
                'affectations': row['affectations'],
                'employes': row['employes_count'],
                'actives': row['actives'],
            }
            for row in service_rows
        ]

        service_categories = {}
        for row in Equipement.objects.values('service_id', 'categorie__nomCategorie'):
            service_categories.setdefault(row['service_id'], []).append(
                row['categorie__nomCategorie'],
            )

        synthese_services = [
            {
                'service': row['nomService'],
                'affectations': row['affectations'],
                'equipementsActifs': row['actives'],
                'employesConcernes': row['employes_count'],
                'categorieDominante': Counter(
                    service_categories.get(row['idService'], []),
                ).most_common(1)[0][0]
                if service_categories.get(row['idService'])
                else '-',
            }
            for row in service_rows
        ]

        maintenance_by_categorie = {
            row['equipement__categorie_id']: row
            for row in Maintenance.objects.values(
                'equipement__categorie_id',
            ).annotate(
                total=Count('idMaintenance'),
                preventive=Count(
                    'idMaintenance',
                    filter=Q(typeMaintenance__icontains='prévent')
                    | Q(typeMaintenance__icontains='prevent'),
                ),
                curative=Count(
                    'idMaintenance',
                    filter=Q(typeMaintenance__icontains='curatif')
                    | Q(typeMaintenance__icontains='curative'),
                ),
                corrective=Count(
                    'idMaintenance',
                    filter=Q(typeMaintenance__icontains='correct'),
                ),
                coutTotal=Sum('Cout'),
            )
        }

        equipements_par_categorie = {
            row['categorie_id']: row['total']
            for row in Equipement.objects.filter(
                maintenances__isnull=False,
            ).values('categorie_id').annotate(
                total=Count('idEquipement', distinct=True),
            )
        }

        maintenances_par_categorie = []
        for categorie in Categorie.objects.all():
            stats = maintenance_by_categorie.get(categorie.idCategorie)
            maintenances_par_categorie.append({
                'categorie': categorie.nomCategorie,
                'preventive': stats['preventive'] if stats else 0,
                'curative': stats['curative'] if stats else 0,
                'corrective': stats['corrective'] if stats else 0,
                'coutTotal': round(float(stats['coutTotal'] or 0), 2) if stats else 0.0,
                'total': stats['total'] if stats else 0,
                'equipementsConcernes': equipements_par_categorie.get(
                    categorie.idCategorie,
                    0,
                ),
            })

        repartition_maintenances = [
            {
                'name': item['categorie'],
                'amount': item['total'],
            }
            for item in maintenances_par_categorie
            if item['total'] > 0
        ]

        cout_par_devise = {
            row['devise']: round(float(row['total'] or 0), 2)
            for row in Maintenance.objects.values('devise').annotate(total=Sum('Cout'))
        }
        cout_estime_total = round(
            float(
                Maintenance.objects.aggregate(total=Sum('Cout'))['total'] or 0
            ),
            2,
        )

        return Response({
            'overview': overview,
            'affectationsParService': affectations_par_service,
            'maintenancesParCategorie': maintenances_par_categorie,
            'repartitionMaintenances': repartition_maintenances,
            'repartitionTotaux': {
                'interventions': overview['maintenances']['value'],
                'coutEstime': cout_estime_total,
                'coutsParDevise': [
                    {'devise': devise, 'total': total}
                    for devise, total in sorted(cout_par_devise.items())
                ],
            },
            'syntheseServices': synthese_services,
        }, status=status.HTTP_200_OK)


class LookupsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'categories': list(
                Categorie.objects.values('idCategorie', 'nomCategorie'),
            ),
            'employes': list(
                Employe.objects.values(
                    'idEmploye',
                    'nomEmploye',
                    'prenomEmploye',
                ),
            ),
            'services': list(
                Service.objects.values('idService', 'nomService'),
            ),
            'equipements': list(
                Equipement.objects.values('idEquipement', 'codeInventaire'),
            ),
        }, status=status.HTTP_200_OK)


# ============================================================
# Utilisateurs admin — list / create (création = superuser only)
# ============================================================
class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.select_related('profile').all().order_by('date_joined')
        users = apply_search_filter(
            users,
            request,
            ['username', 'email', 'first_name', 'last_name'],
        )
        return get_paginated_response(request, users, UserSerializer)

    def post(self, request):
        if not request.user.is_superuser:
            return Response(
                {
                    'error': (
                        "Seul un super administrateur peut créer "
                        "un utilisateur."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = UserCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# Utilisateurs admin — détail (superusers protégés des non-super)
# ============================================================
class UserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, id_user):
        user = get_object_or_404(User, id=id_user)
        if not _can_manage_target_user(request.user, user):
            return Response(
                {
                    'error': (
                        "Vous ne pouvez pas consulter les informations "
                        "d'un super administrateur."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def patch(self, request, id_user):
        user = get_object_or_404(User, id=id_user)
        if not _can_manage_target_user(request.user, user):
            return _deny_manage_superuser()

        # Attribution de droits réservée au superuser
        if (
            ('is_admin' in request.data or 'is_superuser_account' in request.data)
            and not request.user.is_superuser
        ):
            return Response(
                {
                    'error': (
                        "Seul un super administrateur peut attribuer "
                        "des droits."
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UserUpdateSerializer(
            user,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id_user):
        return self.patch(request, id_user)

    def delete(self, request, id_user):
        user = get_object_or_404(User, id=id_user)
        if not _can_manage_target_user(request.user, user):
            return Response(
                {'error': 'Vous ne pouvez pas supprimer un super administrateur.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user == request.user:
            return Response(
                {'error': 'Vous ne pouvez pas supprimer votre propre compte.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================
# Profil de l'utilisateur connecté (+ photo)
# ============================================================
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        touch_user_presence(request.user)
        user = (
            User.objects.select_related('profile')
            .get(pk=request.user.pk)
        )
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = MeUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            touch_user_presence(request.user)
            user = (
                User.objects.select_related('profile')
                .get(pk=request.user.pk)
            )
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# Heartbeat présence (online si last_seen < 5 min)
# ============================================================
class HeartbeatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        touch_user_presence(request.user)
        return Response({
            'is_online': True,
            'user_id': request.user.id,
        }, status=status.HTTP_200_OK)


# ============================================================
# Recherche globale (header)
# ============================================================
class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if len(query) < 1:
            return Response({'results': []}, status=status.HTTP_200_OK)

        results = []

        for equipement in Equipement.objects.filter(
            Q(codeInventaire__icontains=query)
            | Q(Designation__icontains=query)
            | Q(Marque__icontains=query)
        )[:5]:
            results.append({
                'type': 'equipement',
                'label': f"{equipement.codeInventaire} — {equipement.Designation}",
                'url': f"/equipements/{equipement.idEquipement}",
                'meta': equipement.Etat,
            })

        for employe in Employe.objects.filter(
            Q(nomEmploye__icontains=query)
            | Q(prenomEmploye__icontains=query)
            | Q(Email__icontains=query)
        )[:5]:
            results.append({
                'type': 'employe',
                'label': f"{employe.nomEmploye} {employe.prenomEmploye}",
                'url': f"/employes/{employe.idEmploye}",
                'meta': employe.Fonction,
            })

        for service in Service.objects.filter(
            Q(nomService__icontains=query) | Q(Localisation__icontains=query)
        )[:5]:
            results.append({
                'type': 'service',
                'label': service.nomService,
                'url': f"/services/{service.idService}",
                'meta': service.Localisation,
            })

        for maintenance in Maintenance.objects.filter(
            Q(typeMaintenance__icontains=query) | Q(Description__icontains=query)
        )[:5]:
            results.append({
                'type': 'maintenance',
                'label': f"Maintenance — {maintenance.typeMaintenance}",
                'url': "/maintenances",
                'meta': str(maintenance.dateMaintenance),
            })

        return Response({'results': results[:15]}, status=status.HTTP_200_OK)


# ============================================================
# Notifications header
# ============================================================
class NotificationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        notifications = []

        for equipement in Equipement.objects.filter(
            Etat__in=['En avertissement', 'En panne']
        ).order_by('-dateAcquisition')[:20]:
            notification_type = 'warning' if equipement.Etat == 'En avertissement' else 'danger'
            notifications.append({
                'id': str(equipement.idEquipement),
                'title': f"{equipement.codeInventaire} — {equipement.Etat}",
                'subTitle': equipement.Designation,
                'type': notification_type,
                'url': f"/equipements/{equipement.idEquipement}",
            })

        return Response({
            'count': len(notifications),
            'results': notifications,
        }, status=status.HTTP_200_OK)


class NotificationResolveView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        equipment_id = request.data.get('id')
        if not equipment_id:
            return Response(
                {'error': "L'identifiant de l'équipement est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        equipement = get_object_or_404(Equipement, idEquipement=equipment_id)

        if equipement.Etat not in ('En avertissement', 'En panne'):
            return Response(
                {'error': "Cet équipement n'est plus en alerte."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        equipement.Etat = 'En marche'
        equipement.save(update_fields=['Etat'])

        serializer = EquipementSerializer(equipement)
        return Response({
            'message': "L'équipement a été remis en marche.",
            'equipement': serializer.data,
        }, status=status.HTTP_200_OK)

# ============================================================
# CRUD métier — Affectations, Catégories, Employés, …
# ============================================================
class AffectationListView(APIView):
    def get(self, request):
        affectations = Affectation.objects.select_related('equipement').all().order_by('dateCreation')
        affectations = apply_search_filter(
            affectations,
            request,
            ['equipement__codeInventaire'],
        )
        return get_paginated_response(request, affectations, AffectationSerializer)

    def post(self, request):
        serializer = AffectationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AffectationDetailView(APIView):
    def get(self, request, id_affectation):
        affectation = get_object_or_404(Affectation, idAffectation=id_affectation)
        serializer = AffectationSerializer(affectation)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id_affectation):
        affectation = get_object_or_404(Affectation, idAffectation=id_affectation)
        serializer = AffectationSerializer(affectation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id_affectation):
        affectation = get_object_or_404(Affectation, idAffectation=id_affectation)
        serializer = AffectationSerializer(affectation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id_affectation):
        affectation = get_object_or_404(Affectation, idAffectation=id_affectation)
        affectation.delete()
        return Response({"message": "L'affectation a été supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)

class CategorieListView(APIView):
    def get(self, request):
        categories = Categorie.objects.all().order_by('dateCreation')
        categories = apply_search_filter(categories, request, ['nomCategorie'])
        return get_paginated_response(request, categories, CategorieSerializer)

    def post(self, request):
        serializer = CategorieSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategorieDetailView(APIView):
    def get(self, request, id_categorie):
        categorie = get_object_or_404(Categorie, idCategorie=id_categorie)
        serializer = CategorieSerializer(categorie)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id_categorie):
        categorie = get_object_or_404(Categorie, idCategorie=id_categorie)
        serializer = CategorieSerializer(categorie, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id_categorie):
        categorie = get_object_or_404(Categorie, idCategorie=id_categorie)
        serializer = CategorieSerializer(categorie, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id_categorie):
        categorie = get_object_or_404(Categorie, idCategorie=id_categorie)
        categorie.delete()
        return Response({"message": "La catégorie a été supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)

class EmployeListView(APIView):
    def get(self, request):
        employes = Employe.objects.select_related('service').all().order_by('dateCreation')
        employes = apply_search_filter(
            employes,
            request,
            ['nomEmploye', 'prenomEmploye', 'Fonction', 'Email', 'service__nomService'],
        )
        return get_paginated_response(request, employes, EmployeSerializer)

    def post(self, request):
        serializer = EmployeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeDetailView(APIView):
    def get(self, request, id_employe):
        employe = get_object_or_404(Employe, idEmploye=id_employe)
        serializer = EmployeSerializer(employe)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id_employe):
        employe = get_object_or_404(Employe, idEmploye=id_employe)
        serializer = EmployeSerializer(employe, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id_employe):
        employe = get_object_or_404(Employe, idEmploye=id_employe)
        serializer = EmployeSerializer(employe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id_employe):
        employe = get_object_or_404(Employe, idEmploye=id_employe)
        employe.delete()
        return Response({"message": "L'employé a été supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)

class EquipementListView(APIView):
    def get(self, request):
        equipements = Equipement.objects.all().order_by('dateCreation')
        equipements = apply_search_filter(
            equipements,
            request,
            ['codeInventaire', 'Designation', 'Marque', 'Etat'],
        )
        return get_paginated_response(request, equipements, EquipementSerializer)

    def post(self, request):
        serializer = EquipementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EquipementDetailView(APIView):
    def get(self, request, id_equipement):
        equipement = get_object_or_404(Equipement, idEquipement=id_equipement)
        serializer = EquipementSerializer(equipement)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id_equipement):
        equipement = get_object_or_404(Equipement, idEquipement=id_equipement)
        serializer = EquipementSerializer(equipement, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id_equipement):
        equipement = get_object_or_404(Equipement, idEquipement=id_equipement)
        serializer = EquipementSerializer(equipement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id_equipement):
        equipement = get_object_or_404(Equipement, idEquipement=id_equipement)
        equipement.delete()
        return Response({"message": "L'équipement a été supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)

class MaintenanceListView(APIView):
    def get(self, request):
        maintenances = Maintenance.objects.select_related('equipement').all().order_by('dateCreation')
        maintenances = apply_search_filter(
            maintenances,
            request,
            ['typeMaintenance', 'Description', 'equipement__codeInventaire'],
        )
        return get_paginated_response(request, maintenances, MaintenanceSerializer)

    def post(self, request):
        serializer = MaintenanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MaintenanceDetailView(APIView):
    def get(self, request, id_maintenance):
        maintenance = get_object_or_404(Maintenance, idMaintenance=id_maintenance)
        serializer = MaintenanceSerializer(maintenance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id_maintenance):
        maintenance = get_object_or_404(Maintenance, idMaintenance=id_maintenance)
        serializer = MaintenanceSerializer(maintenance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id_maintenance):
        maintenance = get_object_or_404(Maintenance, idMaintenance=id_maintenance)
        serializer = MaintenanceSerializer(maintenance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id_maintenance):
        maintenance = get_object_or_404(Maintenance, idMaintenance=id_maintenance)
        maintenance.delete()
        return Response({"message": "La maintenance a été supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)

class ServiceListView(APIView):
    def get(self, request):
        services = Service.objects.all().order_by('dateCreation')
        services = apply_search_filter(
            services,
            request,
            ['nomService', 'Localisation'],
        )
        return get_paginated_response(request, services, ServiceSerializer)

    def post(self, request):
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ServiceDetailView(APIView):
    def get(self, request, id_service):
        service = get_object_or_404(Service, idService=id_service)
        serializer = ServiceSerializer(service)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id_service):
        service = get_object_or_404(Service, idService=id_service)
        serializer = ServiceSerializer(service, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id_service):
        service = get_object_or_404(Service, idService=id_service)
        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id_service):
        service = get_object_or_404(Service, idService=id_service)
        service.delete()
        return Response({"message": "Le service a été supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)