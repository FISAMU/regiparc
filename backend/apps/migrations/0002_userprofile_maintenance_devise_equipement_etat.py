from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("apps", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="maintenance",
            name="devise",
            field=models.CharField(
                choices=[("CDF", "CDF"), ("USD", "USD")],
                default="USD",
                max_length=3,
                verbose_name="Devise",
            ),
        ),
        migrations.AlterField(
            model_name="equipement",
            name="Etat",
            field=models.CharField(
                choices=[
                    ("En marche", "En marche"),
                    ("En avertissement", "En avertissement"),
                    ("En panne", "En panne"),
                ],
                default="En marche",
                max_length=50,
                verbose_name="État de l'équipement",
            ),
        ),
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("last_seen", models.DateTimeField(blank=True, null=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
