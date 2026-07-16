"""
Envoi d'emails RegiParc.

Sur Render (free), le SMTP (port 587/465) est souvent bloqué → timeout.
On privilégie Resend (API HTTPS :443) en production.
En local, SMTP Gmail reste possible.
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
    resend_key = getattr(settings, "RESEND_API_KEY", "") or ""
    if resend_key.strip():
        _send_via_resend(to_email=to_email, subject=subject, body=body)
        return

    if not getattr(settings, "EMAIL_HOST_USER", None) or not getattr(
        settings, "EMAIL_HOST_PASSWORD", None
    ):
        raise RuntimeError(
            "Aucun canal email configuré. "
            "Sur Render, ajoutez RESEND_API_KEY (recommandé). "
            "En local, configurez EMAIL_HOST_USER / EMAIL_HOST_PASSWORD."
        )

    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )


def _send_via_resend(*, to_email: str, subject: str, body: str) -> None:
    from_email = (
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
            "Vérifiez RESEND_API_KEY et RESEND_FROM_EMAIL."
        ) from exc
    except Exception as exc:
        logger.exception("Échec Resend: %s", exc)
        raise
