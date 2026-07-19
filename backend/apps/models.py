"""
Modèles métier RegiParc (parc informatique).

Entités principales :
  - Service, Categorie, Employe, Equipement
  - Affectation, Maintenance
  - UserProfile (photo + dernière activité)
  - PasswordResetCode (réinitialisation MDP par email)
"""
import uuid
from django.db import models
from django.conf import settings


# ---------------------------------------------------------------------------
# Affectation d'un équipement (historique dates affectation / retour)
# ---------------------------------------------------------------------------
class Affectation(models.Model):
    idAffectation = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dateAffectation = models.DateField(verbose_name="Date d'affectation")
    dateRetour = models.DateField(null=True, blank=True, verbose_name="Date de retour")
    dateCreation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    # Clé héritée de Equipement
    equipement = models.ForeignKey('Equipement', on_delete=models.CASCADE, related_name="affectations")

    def __str__(self):
        return f"Affectation {self.equipement.codeInventaire} du {self.dateAffectation}"

# ---------------------------------------------------------------------------
# Catégorie d'équipement (ex. PC, imprimante…)
# ---------------------------------------------------------------------------
class Categorie(models.Model):
    idCategorie = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nomCategorie = models.CharField(max_length=100, verbose_name="Nom de la catégorie")
    dateCreation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    def __str__(self):
        return self.nomCategorie

# ---------------------------------------------------------------------------
# Employé : fonction libre + rattachement optionnel à un Service
# ---------------------------------------------------------------------------
class Employe(models.Model):
    idEmploye = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nomEmploye = models.CharField(max_length=100, verbose_name="Nom")
    prenomEmploye = models.CharField(max_length=100, verbose_name="Prénom")
    Fonction = models.CharField(max_length=100, verbose_name="Fonction")
    Email = models.EmailField(max_length=150, unique=True, verbose_name="Adresse Email")
    service = models.ForeignKey(
        'Service',
        on_delete=models.PROTECT,
        related_name="employes",
        null=True,
        blank=True,
        verbose_name="Service",
    )
    dateCreation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    def __str__(self):
        return f"{self.nomEmploye} {self.prenomEmploye}"
    
# ---------------------------------------------------------------------------
# Équipement inventorié (état, valeur, liens catégorie / employé / service)
# ---------------------------------------------------------------------------
class Equipement(models.Model):
    idEquipement = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    codeInventaire = models.CharField(max_length=100, unique=True, verbose_name="Code Inventaire")
    Designation = models.CharField(max_length=150, verbose_name="Désignation")
    Marque = models.CharField(max_length=100, verbose_name="Marque")
    Modele = models.CharField(max_length=100, verbose_name="Modèle")
    numSerie = models.CharField(max_length=100, unique=True, verbose_name="Numéro de Série")
    dateAcquisition = models.DateField(verbose_name="Date d'Acquisition")
    valeur = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Valeur")
    Etat = models.CharField(
        max_length=50,
        verbose_name="État de l'équipement",
        choices=[
            ("En marche", "En marche"),
            ("En avertissement", "En avertissement"),
            ("En panne", "En panne"),
        ],
        default="En marche",
    )
    dateCreation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    # Clés étrangères pointant vers les autres applications
    categorie = models.ForeignKey('Categorie', on_delete=models.PROTECT, related_name="equipements")
    employe = models.ForeignKey('Employe', on_delete=models.SET_NULL, null=True, blank=True, related_name="equipements")
    service = models.ForeignKey('Service', on_delete=models.PROTECT, related_name="equipements")

    def __str__(self):
        return f"{self.codeInventaire}"

# ---------------------------------------------------------------------------
# Maintenance : coût + devise (CDF / USD) — alimente le dashboard
# ---------------------------------------------------------------------------
class Maintenance(models.Model):
    idMaintenance = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dateMaintenance = models.DateField(verbose_name="Date de la maintenance")
    typeMaintenance = models.CharField(max_length=100, verbose_name="Type de maintenance")
    Description = models.TextField(verbose_name="Description")
    Cout = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Coût")
    devise = models.CharField(
        max_length=3,
        verbose_name="Devise",
        choices=[("CDF", "CDF"), ("USD", "USD")],
        default="USD",
    )
    dateCreation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    # Clé héritée de Equipement
    equipement = models.ForeignKey('Equipement', on_delete=models.CASCADE, related_name="maintenances")

    def __str__(self):
        return f"Maintenance {self.typeMaintenance} - {self.equipement.codeInventaire}"
    
# ---------------------------------------------------------------------------
# Service organisationnel (localisation)
# ---------------------------------------------------------------------------
class Service(models.Model):
    idService = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nomService = models.CharField(max_length=100, verbose_name="Nom du service")
    Localisation = models.CharField(max_length=150, verbose_name="Localisation")
    dateCreation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    def __str__(self):
        return self.nomService


# ---------------------------------------------------------------------------
# Extension du User Django : présence + photo (base64 / data-URL)
# ---------------------------------------------------------------------------
class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    last_seen = models.DateTimeField(null=True, blank=True)
    # True après un logout explicite (reste hors ligne même si last_seen est récent)
    force_offline = models.BooleanField(default=False)
    photo = models.TextField(
        null=True,
        blank=True,
        verbose_name="Photo de profil",
    )

    def __str__(self):
        return f"Profil de {self.user.username}"


# ---------------------------------------------------------------------------
# Code à 6 chiffres envoyé par email pour reset mot de passe
# ---------------------------------------------------------------------------
class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_codes",
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Code reset {self.code} — {self.user.email}"
