from django.db import models

# Create your models here.
from django.db import models
from users.models import User

class NGOProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    volunteers = models.IntegerField(default=0)
    ambulances = models.IntegerField(default=0)
    efficiency_score = models.FloatField(default=0)