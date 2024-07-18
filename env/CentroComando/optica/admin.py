from django.contrib import admin
from .models import Cliente, Producto, Cita

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'rut_completo', 'telefono')
    search_fields = ('nombre', 'apellido', 'rut')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'armazon', 'precio', 'stock', 'categoria')
    list_filter = ('categoria',)
    search_fields = ('codigo', 'armazon')

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha_hora', 'estado')
    list_filter = ('estado',)
    search_fields = ('nombre', 'email')