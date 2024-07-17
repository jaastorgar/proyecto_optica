from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

# Create your models here.
class Cliente(models.Model):
    rut = models.IntegerField(
        validators=[
            MinValueValidator(1000000),
            MaxValueValidator(99999999)
        ]
    )
    dv = models.CharField(
        max_length=1,
        validators=[
            RegexValidator(
                regex=r'^[0-9kK]{1}$',
                message="El dígito verificador debe ser un número o 'K'"
            )
        ]
    )
    dv = models.CharField(max_length=1)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    telefono = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.rut_completo}"

    @property
    def rut_completo(self):
        return f"{self.rut}-{self.dv}"


class Producto(models.Model):
    codigo = models.CharField(max_length=10, primary_key=True, null=False)
    armazon = models.CharField(max_length=50, null=False)
    caracteristica = models.TextField(max_length=1000, null=False)
    precio = models.IntegerField(null=False)
    stock = models.IntegerField(null=False)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    categoria = models.CharField(max_length=50, null=False)
    marca = models.CharField(max_length=50, null=False)
    genero = models.CharField(max_length=20, null=False)
    forma_marco = models.CharField(max_length=50, null=False)
    color_armazon = models.CharField(max_length=50, null=False)
    color_cristal = models.CharField(max_length=50, null=False)

    def __str__(self):
        return self.codigo