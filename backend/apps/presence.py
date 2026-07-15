"""
Présence en ligne des admins (basée sur UserProfile.last_seen).

Un utilisateur est « online » si last_seen < ONLINE_THRESHOLD (5 min).
Appelé par heartbeat frontend + login/logout.
"""
from datetime import timedelta

from django.utils import timezone

ONLINE_THRESHOLD = timedelta(minutes=5)


def clear_user_presence(user):
    from .models import UserProfile

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.last_seen = None
    profile.save(update_fields=["last_seen"])
    return profile


def touch_user_presence(user):
    from .models import UserProfile

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.last_seen = timezone.now()
    profile.save(update_fields=["last_seen"])
    return profile


def is_user_online(user):
    if not user.is_authenticated:
        return False

    profile = getattr(user, "profile", None)
    if profile is None or profile.last_seen is None:
        return False

    return timezone.now() - profile.last_seen <= ONLINE_THRESHOLD
