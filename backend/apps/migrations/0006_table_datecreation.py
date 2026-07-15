import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0005_employe_datecreation"),
    ]

    operations = [
        migrations.AddField(
            model_name="affectation",
            name="dateCreation",
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name="Date de création",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="categorie",
            name="dateCreation",
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name="Date de création",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="equipement",
            name="dateCreation",
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name="Date de création",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="maintenance",
            name="dateCreation",
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name="Date de création",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="service",
            name="dateCreation",
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name="Date de création",
            ),
            preserve_default=False,
        ),
    ]
