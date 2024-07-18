from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone

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
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
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
    imagen = models.ImageField(upload_to='optica/images', blank=True, null=True)
    categoria = models.CharField(max_length=50, null=False)
    marca = models.CharField(max_length=50, null=False)
    genero = models.CharField(max_length=20, null=False)
    forma_marco = models.CharField(max_length=50, null=False)
    color_armazon = models.CharField(max_length=50, null=False)
    color_cristal = models.CharField(max_length=50, null=False)

    def __str__(self):
        return self.codigo


class Cita(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    telefono = models.CharField(max_length=15)
    fecha_hora = models.DateTimeField()
    motivo = models.TextField()
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='pendiente')
    fecha_solicitud = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Cita de {self.nombre} para {self.fecha_hora}"