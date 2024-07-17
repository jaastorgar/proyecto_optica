from django.urls import path
from .views import home, armazones_view, crear_cita


urlpatterns = [
    path('', home, name='home'),
    path('armazones/', armazones_view, name='armazones'),
    path('cita/', crear_cita, name='cita'),
]