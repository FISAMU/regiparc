"""
Envoi d'emails RegiParc.

Sur Render (free), le SMTP (port 587/465) est souvent bloqué → timeout.
On privilégie Resend (API HTTPS :443) en production.
En local, SMTP Gmail reste possible.

Important Resend : un header User-Agent est OBLIGATOIRE
(sinon Cloudflare renvoie 403 / error code 1010).
"""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_app_email(*, to_email: str, subject: str, body: str) -> None:
    """Envoie un email texte. Lève une Exception en cas d'échec."""
    resend_key = (getattr(settings, "RESEND_API_KEY", "") or "").strip()
    if resend_key:
        _send_via_resend(to_email=to_email, subject=subject, body=body)
        return

    if not getattr(settings, "DEBUG", False):
        raise RuntimeError(
            "RESEND_API_KEY manquant sur Render. "
            "Ajoutez RESEND_API_KEY (clé re_...) dans Environment, "
            "puis redéployez. Le SMTP Gmail ne fonctionne pas sur Render free."
        )

    if not getattr(settings, "EMAIL_HOST_USER", None) or not getattr(
        settings, "EMAIL_HOST_PASSWORD", None
    ):
        raise RuntimeError(
            "Aucun canal email configuré. "
            "En local: EMAIL_HOST_USER / EMAIL_HOST_PASSWORD. "
            "Sur Render: RESEND_API_KEY."
        )

    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )


def _normalize_resend_from(from_email: str) -> str:
    """
    Resend refuse d'envoyer depuis @gmail.com / domaines non vérifiés.
    En test, on force onboarding@resend.dev.
    """
    value = (from_email or "").strip()
    lower = value.lower()
    if (
        not value
        or "@gmail.com" in lower
        or "@googlemail.com" in lower
        or "@hotmail." in lower
        or "@outlook." in lower
        or "@yahoo." in lower
    ):
        return "RegiParc <onboarding@resend.dev>"
    return value


def _send_via_resend(*, to_email: str, subject: str, body: str) -> None:
    from_email = _normalize_resend_from(
        getattr(settings, "RESEND_FROM_EMAIL", None)
        or getattr(settings, "DEFAULT_FROM_EMAIL", None)
        or "RegiParc <onboarding@resend.dev>"
    )
    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "text": body,
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=data,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
            "Content-Type": "application/json",
            # Obligatoire : sans User-Agent → Cloudflare 403 / code 1010
            "User-Agent": "RegiParc/1.0 (Django; Render)",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            response.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        logger.error("Resend HTTP %s: %s", exc.code, detail)
        raise RuntimeError(
            f"Resend a refusé l'envoi (HTTP {exc.code}). "
            f"Détail: {detail[:300]}"
        ) from exc
    except Exception as exc:
        logger.exception("Échec Resend: %s", exc)
        raise
