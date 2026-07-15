from django.contrib import admin
from .models import Affectation, Categorie, Employe, Equipement, Maintenance, Service

@admin.register(Affectation)
class AffectationAdmin(admin.ModelAdmin):
    list_display = ('equipement', 'dateAffectation', 'dateRetour')
    search_fields = ('equipement__codeInventaire', 'equipement__Designation')
    list_filter = ('dateAffectation', 'dateRetour')
    date_hierarchy = 'dateAffectation'
    
@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nomCategorie', 'idCategorie')  # Pratique d'afficher l'UUID pour vérification
    search_fields = ('nomCategorie',)
    
@admin.register(Employe)
class EmployeAdmin(admin.ModelAdmin):
    # Les colonnes qui vont s'afficher dans le tableau
    list_display = ('nomEmploye', 'prenomEmploye', 'Fonction', 'Email')
    
    # Ajouter une barre de recherche (recherche par nom ou fonction)
    search_fields = ('nomEmploye', 'prenomEmploye', 'Fonction')
    
    # Ajouter un filtre latéral par Fonction
    list_filter = ('Fonction',)

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = ('codeInventaire', 'Designation', 'Marque', 'Modele', 'Etat', 'categorie', 'employe', 'service')
    search_fields = ('codeInventaire', 'Designation', 'Marque', 'numSerie')
    list_filter = ('Etat', 'categorie', 'service')  # Filtres latéraux très puissants pour le parc
    date_hierarchy = 'dateAcquisition'  # Ajoute une barre de navigation temporelle par date
    
@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('equipement', 'typeMaintenance', 'dateMaintenance', 'Cout')
    search_fields = ('equipement__codeInventaire', 'equipement__Designation', 'typeMaintenance') # Le "__" permet de chercher dans le modèle Equipement lié
    list_filter = ('typeMaintenance', 'dateMaintenance')
    date_hierarchy = 'dateMaintenance'

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nomService', 'Localisation')
    search_fields = ('nomService', 'Localisation')
    list_filter = ('Localisation',)
