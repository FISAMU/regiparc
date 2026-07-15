"""
Routes API RegiParc (préfixe global : /api/ via mon_backend/urls.py).

Groupes :
  - Auth + reset MDP
  - CRUD métier (affectations, employés, …)
  - Dashboard, users, recherche, notifications
"""
from django.urls import path
from . import views

app_name = 'apps'

urlpatterns = [
    # --- Authentification ---
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('password-reset/request/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/verify/', views.PasswordResetVerifyView.as_view(), name='password-reset-verify'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    path('affectations/', views.AffectationListView.as_view(), name='AffectationListView'),
    path('affectations/<uuid:id_affectation>/', views.AffectationDetailView.as_view(), name='AffectationDetailView'),
    
    path('employes/', views.EmployeListView.as_view(), name='EmployeListView'),
    path('employes/<uuid:id_employe>/', views.EmployeDetailView.as_view(), name='EmployeDetailView'),
    
    path('categories/', views.CategorieListView.as_view(), name='CategorieListView'),
    path('categories/<uuid:id_categorie>/', views.CategorieDetailView.as_view(), name='CategorieDetailView'),
    
    path('equipements/', views.EquipementListView.as_view(), name='EquipementListView'),
    path('equipements/<uuid:id_equipement>/', views.EquipementDetailView.as_view(), name='EquipementDetailView'),
    
    path('services/', views.ServiceListView.as_view(), name='ServiceListView'),
    path('services/<uuid:id_service>/', views.ServiceDetailView.as_view(), name='ServiceDetailView'),
    
    path('maintenances/', views.MaintenanceListView.as_view(), name='MaintenanceListView'),
    path('maintenances/<uuid:id_maintenance>/', views.MaintenanceDetailView.as_view(), name='MaintenanceDetailView'),

    path('dashboard/', views.DashboardView.as_view(), name='DashboardView'),
    path('dashboard/overview/', views.DashboardOverviewView.as_view(), name='DashboardOverviewView'),
    path('lookups/', views.LookupsView.as_view(), name='LookupsView'),

    path('users/me/heartbeat/', views.HeartbeatView.as_view(), name='HeartbeatView'),
    path('users/me/', views.MeView.as_view(), name='MeView'),
    path('users/', views.UserListView.as_view(), name='UserListView'),
    path('users/<int:id_user>/', views.UserDetailView.as_view(), name='UserDetailView'),

    path('search/', views.SearchView.as_view(), name='SearchView'),
    path('notifications/', views.NotificationView.as_view(), name='NotificationView'),
    path('notifications/resolve/', views.NotificationResolveView.as_view(), name='NotificationResolveView'),
]