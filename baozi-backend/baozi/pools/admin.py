from django.contrib import admin
from baozi.networks.models import Network
from baozi.pools.models import Pool
from baozi.users.models import User
from baozi.tokens.models import Token
# Register your models here.

admin.site.register(User)
admin.site.register(Pool)
admin.site.register(Token)
admin.site.register(Network)