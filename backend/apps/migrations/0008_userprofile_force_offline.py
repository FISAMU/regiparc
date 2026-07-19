# Generated manually for UserProfile.force_offline

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("apps", "0007_passwordresetcode"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="force_offline",
            field=models.BooleanField(default=False),
        ),
    ]
