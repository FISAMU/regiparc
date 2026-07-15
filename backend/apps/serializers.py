"""
Serializers DRF — conversion modèles ↔ JSON pour l'API RegiParc.

- Entités métier : Categorie, Service, Employe, Equipement, …
- Users : UserSerializer / UserCreateSerializer / UserUpdateSerializer
  (droits admin & protection des superusers)
- MeUpdateSerializer : profil + photo de l'utilisateur connecté
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Affectation, Categorie, Employe, Equipement, Maintenance, Service
from .presence import is_user_online

User = get_user_model()

EQUIPEMENT_ETATS = ("En marche", "En avertissement", "En panne")


# ---------------------------------------------------------------------------
# Entités métier
# ---------------------------------------------------------------------------
class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class EmployeSerializer(serializers.ModelSerializer):
    service_nom = serializers.SerializerMethodField()

    class Meta:
        model = Employe
        fields = '__all__'

    def get_service_nom(self, obj):
        return obj.service.nomService if obj.service_id else None


class EquipementSerializer(serializers.ModelSerializer):
    def validate_Etat(self, value):
        if value not in EQUIPEMENT_ETATS:
            raise serializers.ValidationError(
                "État invalide. Choisissez: En marche, En avertissement ou En panne."
            )
        return value

    class Meta:
        model = Equipement
        fields = '__all__'


class AffectationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Affectation
        fields = '__all__'


class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = '__all__'


# ---------------------------------------------------------------------------
# Compte admin (liste / lecture)
# ---------------------------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    nom = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined',
            'role',
            'nom',
            'is_online',
            'photo',
        ]
        read_only_fields = ['id', 'date_joined', 'is_superuser', 'is_online', 'photo']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'Super admin'
        if obj.is_staff:
            return 'Admin'
        return 'Utilisateur'

    def get_nom(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username

    def get_is_online(self, obj):
        return is_user_online(obj)

    def get_photo(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.photo if profile and profile.photo else None


# ---------------------------------------------------------------------------
# Création utilisateur (réservée aux superusers côté vue)
# ---------------------------------------------------------------------------
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    is_admin = serializers.BooleanField(default=False, write_only=True)
    is_superuser_account = serializers.BooleanField(
        default=False,
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'is_admin',
            'is_superuser_account',
            'is_active',
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà utilisé.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_superuser:
            raise serializers.ValidationError(
                "Seul un super administrateur peut créer un utilisateur.",
            )

        is_admin = validated_data.pop('is_admin', False)
        is_superuser_account = validated_data.pop('is_superuser_account', False)
        password = validated_data.pop('password')
        user = User(**validated_data)

        if is_superuser_account:
            user.is_superuser = True
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = bool(is_admin)

        user.set_password(password)
        user.save()
        return user


# ---------------------------------------------------------------------------
# Mise à jour utilisateur admin (droits, activation…)
# ---------------------------------------------------------------------------
class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    is_admin = serializers.BooleanField(required=False, write_only=True)
    is_superuser_account = serializers.BooleanField(
        required=False,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'is_admin',
            'is_superuser_account',
            'is_active',
        ]

    def validate_email(self, value):
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_username(self, value):
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(username=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà utilisé.")
        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        actor = getattr(request, 'user', None) if request else None

        if instance.is_superuser and actor and not actor.is_superuser:
            raise serializers.ValidationError(
                "Vous ne pouvez pas modifier un super administrateur."
            )

        is_admin = validated_data.pop('is_admin', None)
        is_superuser_account = validated_data.pop('is_superuser_account', None)
        password = validated_data.pop('password', None)

        if is_admin is not None or is_superuser_account is not None:
            if not actor or not actor.is_superuser:
                raise serializers.ValidationError(
                    "Seul un super administrateur peut attribuer des droits.",
                )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if is_superuser_account is not None:
            instance.is_superuser = bool(is_superuser_account)
            if instance.is_superuser:
                instance.is_staff = True
            elif is_admin is not None:
                instance.is_staff = bool(is_admin)
        elif is_admin is not None:
            instance.is_staff = bool(is_admin)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


# ---------------------------------------------------------------------------
# Mise à jour du profil connecté (nom, photo…)
# ---------------------------------------------------------------------------
class MeUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    photo = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'photo']

    def validate_email(self, value):
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate_username(self, value):
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(username=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà utilisé.")
        return value

    def validate_photo(self, value):
        if value in (None, ''):
            return value
        if not isinstance(value, str) or not value.startswith('data:image/'):
            raise serializers.ValidationError(
                "La photo doit être une image encodée (data URL).",
            )
        # Approximatif : base64 ≈ 4/3 de la taille binaire → 5 Mo ≈ 7 Mo de data URL
        max_chars = 7 * 1024 * 1024
        if len(value) > max_chars:
            raise serializers.ValidationError(
                "La photo ne doit pas dépasser 5 Mo.",
            )
        return value

    def update(self, instance, validated_data):
        from .models import UserProfile
        from .presence import touch_user_presence

        password = validated_data.pop('password', None)
        photo = validated_data.pop('photo', ...)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if photo is not ...:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.photo = photo or None
            profile.save(update_fields=['photo'])

        touch_user_presence(instance)
        return instance