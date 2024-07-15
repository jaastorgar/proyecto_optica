from django.urls import path
from .views import home, armazones_view


urlpatterns = [
    path('', home, name='home'),
    path('armazones/', armazones_view, name='armazones'),
]