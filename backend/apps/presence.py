"""
Présence en ligne des admins (basée sur UserProfile.last_seen).

Un utilisateur est « online » si :
- force_offline est False, et
- last_seen < ONLINE_THRESHOLD (5 min).

Au logout : last_seen = maintenant + force_offline = True
→ hors ligne immédiat, avec horodatage pour « Déconnecté il y a … ».
"""
from datetime import timedelta

from django.utils import timezone

ONLINE_THRESHOLD = timedelta(minutes=5)


def clear_user_presence(user):
    """Marque l'utilisateur hors ligne (logout) en conservant last_seen."""
    from .models import UserProfile

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.last_seen = timezone.now()
    profile.force_offline = True
    profile.save(update_fields=["last_seen", "force_offline"])
    return profile


def touch_user_presence(user):
    from .models import UserProfile

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.last_seen = timezone.now()
    profile.force_offline = False
    profile.save(update_fields=["last_seen", "force_offline"])
    return profile


def is_user_online(user):
    if not user.is_authenticated:
        return False

    profile = getattr(user, "profile", None)
    if profile is None or profile.last_seen is None:
        return False
    if getattr(profile, "force_offline", False):
        return False

    return timezone.now() - profile.last_seen <= ONLINE_THRESHOLD


def get_last_seen_iso(user):
    profile = getattr(user, "profile", None)
    if profile is None or profile.last_seen is None:
        return None
    return profile.last_seen.isoformat()
