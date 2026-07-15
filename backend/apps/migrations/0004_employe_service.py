from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("apps", "0003_userprofile_photo"),
    ]

    operations = [
        migrations.AddField(
            model_name="employe",
            name="service",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="employes",
                to="apps.service",
                verbose_name="Service",
            ),
        ),
    ]
