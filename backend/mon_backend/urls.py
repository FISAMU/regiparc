"""
URLs racine Django RegiParc.

- /super/  → admin Jazzmin
- /api/    → API REST (apps.urls)
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('super/', admin.site.urls),
    
    path('api/', include('apps.urls')),
]
