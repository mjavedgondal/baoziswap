from django.db import models

from baozi.settings import ADDRESS_LENGTH

class User(models.Model):
    address = models.CharField(max_length=ADDRESS_LENGTH, unique=True)