from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('citizen', 'Citizen'),
        ('ngo', 'NGO'),
        ('government', 'Government'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        blank=False,
        null=False,
        help_text="Role required during registration"
    )
    reliability_score = models.FloatField(default=100)

    class Meta:
        indexes = [
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.username} ({self.role})"

    def is_citizen(self):
        return self.role == 'citizen'

    def is_ngo(self):
        return self.role == 'ngo'

    def is_government(self):
        return self.role == 'government'