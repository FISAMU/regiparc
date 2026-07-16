from pathlib import Path
import environ # 1. Import de django-environ

# 2. Initialiser environ
env = environ.Env(
    # Définir des valeurs par défaut si la variable est absente du .env
    DEBUG=(bool, False)
)

BASE_DIR = Path(__file__).resolve().parent.parent

# 3. Lire le fichier .env
environ.Env.read_env(BASE_DIR / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

# Autorise l'upload de photos profil jusqu'à ~5 Mo (base64 inclus)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])


# Application definition

INSTALLED_APPS = [
    'jazzmin',
    
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'corsheaders',
    'apps',
    'rest_framework',
    'rest_framework.authtoken',
]



MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS — localhost en dev ; URL Vercel en prod (variables Render)
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000", "http://127.0.0.1:3000"],
)

CORS_ALLOW_ALL_ORIGINS = False

# Proxy HTTPS Render
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# DRF — Authentification par Token
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}


ROOT_URLCONF = 'mon_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mon_backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

_db_options = {
    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    'connect_timeout': 10,
}
# Aiven exige SSL en production — mettre DB_SSL=True sur Render
if env.bool('DB_SSL', default=False):
    _db_options['ssl'] = {'ssl': True}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
        'CONN_MAX_AGE': 60,
        'OPTIONS': _db_options,
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

JAZZMIN_SETTINGS = {
    # Titre de l'onglet du navigateur
    "site_title": "RegiParc Admin",
    
    # Titre affiché sur l'écran de connexion
    "site_header": "RegiParc",
    
    # Logo textuel de la marque en haut à gauche
    "site_brand": "RegiParc Admin",
    
    # Message de bienvenue sur l'écran de connexion
    "welcome_sign": "Bienvenue sur RegiParc Admin",
    
    # Droits d'auteur dans le pied de page
    "copyright": "RegiParc Ltd",
    
    # Organisation des menus de gauche (Garder ouvert ou fermé par défaut)
    "show_sidebar": True,
    "navigation_expanded": True,
    
    # Changer l'icône à côté de tes applications (optionnel, utilise FontAwesome)
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "apps.employe": "fas fa-users",
        "apps.equipement": "fas fa-laptop",
        "apps.categorie": "fas fa-tags",
        "apps.service": "fas fa-building",
        "apps.maintenance": "fas fa-tools",
        "apps.affectation": "fas fa-handshake",
    },
}

JAZZMIN_UI_TUNER = {
    "theme": "flatly",       # Applique un thème global moderne et épuré
    "dark_mode_theme": "darkly", # Thème à appliquer quand le mode sombre est coché
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}

# Email — réinitialisation du mot de passe (SMTP Gmail)
EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="").strip()
# Mot de passe d'application Gmail : espaces acceptés à la saisie, retirés ici
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="").replace(" ", "")
DEFAULT_FROM_EMAIL = env(
    "DEFAULT_FROM_EMAIL",
    default=EMAIL_HOST_USER or "RegiParc <noreply@regiparc.local>",
)

_smtp_configured = bool(EMAIL_HOST_USER and EMAIL_HOST_PASSWORD)
EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default=(
        "django.core.mail.backends.smtp.EmailBackend"
        if _smtp_configured
        else "django.core.mail.backends.console.EmailBackend"
    ),
)
PASSWORD_RESET_CODE_EXPIRY_MINUTES = env.int(
    "PASSWORD_RESET_CODE_EXPIRY_MINUTES",
    default=15,
)

# Resend (HTTPS) — recommandé sur Render free (SMTP souvent bloqué)
RESEND_API_KEY = env("RESEND_API_KEY", default="").strip()
RESEND_FROM_EMAIL = env(
    "RESEND_FROM_EMAIL",
    default=DEFAULT_FROM_EMAIL or "RegiParc <onboarding@resend.dev>",
)
