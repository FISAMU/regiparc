"""
Envoi d'emails RegiParc.

Sur Render (free), le SMTP (port 587/465) est souvent bloqué → timeout.
On privilégie Resend (API HTTPS :443) en production.
En local, SMTP Gmail reste possible.

Important Resend :
- Un header User-Agent est OBLIGATOIRE (sinon Cloudflare 403 / code 1010).
- Pour éviter le spam : vérifier un domaine dans Resend et envoyer depuis
  ce domaine (pas onboarding@resend.dev).
"""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def send_password_reset_email(*, to_email: str, first_name: str, code: str, expiry_minutes: int) -> None:
    """Email de reset MDP : HTML personnalisé (logo REGIDESO) + texte de secours."""
    subject = "RegiParc — Code de réinitialisation du mot de passe"
    greeting = first_name or "Utilisateur"
    text_body = (
        f"Bonjour {greeting},\n\n"
        f"Votre code de vérification RegiParc est : {code}\n\n"
        f"Ce code est valide pendant {expiry_minutes} minutes.\n"
        f"Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.\n\n"
        f"— Équipe RegiParc · REGIDESO"
    )
    logo_url = (getattr(settings, "EMAIL_LOGO_URL", "") or "").strip()
    html_body = render_to_string(
        "emails/password_reset.html",
        {
            "first_name": greeting,
            "code": code,
            "expiry_minutes": expiry_minutes,
            "logo_url": logo_url,
        },
    )
    send_app_email(
        to_email=to_email,
        subject=subject,
        body=text_body,
        html_body=html_body,
    )


def send_app_email(
    *,
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
) -> None:
    """Envoie un email texte (+ HTML optionnel). Lève une Exception en cas d'échec."""
    resend_key = (getattr(settings, "RESEND_API_KEY", "") or "").strip()
    if resend_key:
        _send_via_resend(
            to_email=to_email,
            subject=subject,
            body=body,
            html_body=html_body,
        )
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

    if html_body:
        message = EmailMultiAlternatives(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [to_email],
        )
        message.attach_alternative(html_body, "text/html")
        message.send(fail_silently=False)
        return

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


def _send_via_resend(
    *,
    to_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
) -> None:
    from_email = _normalize_resend_from(
        getattr(settings, "RESEND_FROM_EMAIL", None)
        or getattr(settings, "DEFAULT_FROM_EMAIL", None)
        or "RegiParc <onboarding@resend.dev>"
    )
    payload: dict = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "text": body,
    }
    if html_body:
        payload["html"] = html_body

    reply_to = (getattr(settings, "EMAIL_REPLY_TO", "") or "").strip()
    if reply_to:
        payload["reply_to"] = [reply_to]

    # Tags utiles dans le dashboard Resend (pas affichés au destinataire)
    payload["tags"] = [{"name": "app", "value": "regiparc"}]

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
