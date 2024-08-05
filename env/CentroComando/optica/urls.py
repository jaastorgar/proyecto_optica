from django.urls import path
from .views import home, productos_view, crear_cita, registro_cliente, iniciar_sesion, perfil, cerrar_sesion, carrito_view, checkout_view, add_to_cart, actualizar_perfil
from .views import CustomPasswordResetView, CustomPasswordResetDoneView, CustomPasswordResetConfirmView, CustomPasswordResetCompleteView, mis_citas, citas_list, detalle_producto, remove_from_cart
from .views import reprogramar_cita, get_cart_total, update_cart, get_product_stock


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
    path('password_reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('mis-citas/', mis_citas, name='mis_citas'),
    path('citas-list/', citas_list, name='citas_list'),
    path('producto/<str:codigo>/', detalle_producto, name='detalle_producto'),
    path('remove_from_cart/', remove_from_cart, name='remove_from_cart'),
    path('reprogramar_cita/<int:cita_id>/', reprogramar_cita, name='reprogramar_cita'),
    path('get_cart_total/', get_cart_total, name='get_cart_total'),
    path('update_cart/', update_cart, name='update_cart'),
    path('get_product_stock/<str:product_id>/', get_product_stock, name='get_product_stock'),
]