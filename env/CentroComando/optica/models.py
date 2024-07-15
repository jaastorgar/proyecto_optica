from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

# Create your models here.
class cliente(models.Model):
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

class User(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username

class Producto(models.Model):
    codigo = models.CharField(max_length=10)
    armazoncarac = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    categoria = models.CharField(max_length=50)

    def __str__(self):
        return self.codigo