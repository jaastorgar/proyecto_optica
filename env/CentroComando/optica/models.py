from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico debe ser proporcionado')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Cliente(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='cliente')
    rut = models.IntegerField(
        validators=[
            MinValueValidator(1000000),
            MaxValueValidator(99999999)
        ],
        null=True,  # Permite nulos si es apropiado
        blank=True  # Permite campos en blanco en formularios si es apropiado
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
        return self.nombre


class Producto(models.Model):
    codigo = models.CharField(max_length=10, primary_key=True, null=False)
    armazon = models.CharField(max_length=50, null=False)
    caracteristica = models.TextField(max_length=1000, null=False)
    precio = models.IntegerField(null=False)
    stock = models.IntegerField(null=False)
    imagen = models.ImageField(upload_to='static/images', blank=True, null=True)
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

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='citas', null=True, blank=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    telefono = models.CharField(max_length=15)
    fecha_hora = models.DateTimeField()
    motivo = models.TextField()
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='pendiente')
    fecha_solicitud = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Cita de {self.nombre} para {self.fecha_hora}"