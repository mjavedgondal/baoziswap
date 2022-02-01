from django.db import models

from baozi.settings import ADDRESS_LENGTH
from baozi.tokens.models import Token
from baozi.users.models import User


class Pool(models.Model):
    address = models.CharField(max_length=ADDRESS_LENGTH, unique=True)
    token0 = models.ForeignKey(
        Token, 
        verbose_name='token0', 
        on_delete=models.PROTECT,
        related_name='token0_pools'
    )
    token1 = models.ForeignKey(
        Token,
        verbose_name='token1', 
        on_delete=models.PROTECT,
        related_name='token1_pools'
    )

    providers = models.ManyToManyField(User)


    