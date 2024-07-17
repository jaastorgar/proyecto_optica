from django.urls import path
from .views import home, armazones_view, crear_cita, registro, iniciar_sesion, perfil, cerrar_sesion


urlpatterns = [
    path('', home, name='home'),
    path('armazones/', armazones_view, name='armazones'),
    path('cita/', crear_cita, name='cita'),
    path('registro/', registro, name='registro'),
    path('login/', iniciar_sesion, name='login'),
    path('perfil/', perfil, name='perfil'),
    path('logout/', cerrar_sesion, name='logout'),
]