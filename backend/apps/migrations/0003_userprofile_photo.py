from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0002_userprofile_maintenance_devise_equipement_etat"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="photo",
            field=models.TextField(
                blank=True,
                null=True,
                verbose_name="Photo de profil",
            ),
        ),
    ]
