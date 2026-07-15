import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0004_employe_service"),
    ]

    operations = [
        migrations.AddField(
            model_name="employe",
            name="dateCreation",
            field=models.DateTimeField(
                auto_now_add=True,
                default=django.utils.timezone.now,
                verbose_name="Date de création",
            ),
            preserve_default=False,
        ),
    ]
