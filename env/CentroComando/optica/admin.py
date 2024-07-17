from django.contrib import admin
from .models import Cliente, Producto

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'rut_completo', 'email', 'telefono')
    search_fields = ('nombre', 'apellido', 'rut')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'armazon', 'precio', 'stock', 'categoria', 'marca', 'genero')
    list_filter = ('categoria', 'marca', 'genero', 'forma_marco')
    search_fields = ('codigo', 'armazon', 'marca')