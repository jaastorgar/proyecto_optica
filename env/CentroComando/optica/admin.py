from django.contrib import admin
from .models import Cliente, User, Producto

# Register your models here.
@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'rut_completo', 'email', 'telefono')
    search_fields = ('nombre', 'apellido', 'rut')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username',)
    search_fields = ('username',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'armazoncarac', 'precio', 'stock', 'categoria')
    list_filter = ('categoria',)
    search_fields = ('codigo', 'armazoncarac')