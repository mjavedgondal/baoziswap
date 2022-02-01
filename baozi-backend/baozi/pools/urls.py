from baozi.pools.views import PoolByAddressView, PoolView
from django.urls import path

urlpatterns = [
    path('', PoolView.as_view()),
    path('<str:address>/', PoolByAddressView.as_view()),
]
