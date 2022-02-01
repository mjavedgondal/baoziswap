
from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions




schema_view = get_schema_view(
    openapi.Info(
        title='baozi',
        default_version="v1",
        description='api for baozi',
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/v1/pools/', include('baozi.pools.urls')),
    path('api/v1/tokens/', include('baozi.tokens.urls')),
    path(
        "api/v1/swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
]
