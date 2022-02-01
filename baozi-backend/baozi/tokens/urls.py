from baozi.tokens.views import TokenView
from django.urls import path

urlpatterns = [
    path('<str:user_address>/', TokenView.as_view())
]
