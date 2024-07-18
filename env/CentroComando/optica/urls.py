from django.urls import path
from .views import home, productos_view, crear_cita, registro_cliente, iniciar_sesion, perfil, cerrar_sesion, carrito_view, checkout_view, add_to_cart, actualizar_perfil


urlpatterns = [
    path('', home, name='home'),
    path('productos/', productos_view, name='productos'),
    path('cita/', crear_cita, name='cita'),
    path('registro/', registro_cliente, name='registro_cliente'),
    path('login/', iniciar_sesion, name='login'),
    path('perfil/', perfil, name='perfil'),
    path('perfil/actualizar/', actualizar_perfil, name='actualizar_perfil'),
    path('logout/', cerrar_sesion, name='logout'),
    path('carrito/', carrito_view, name='carrito'),
    path('checkout/', checkout_view, name='checkout'),
    path('add_to_cart/', add_to_cart, name='add_to_cart'),
]