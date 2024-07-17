from django.shortcuts import render, redirect
from .models import Producto, Cliente
from rest_framework.renderers import JSONRenderer
from .serializer import ProductoSerializer
from .forms import CitaForm
from django.contrib.auth import authenticate, login, logout
from .forms import RegistroForm, LoginForm
from django.contrib.auth.decorators import login_required

# Create your views here.
def home(request):
    return render(request, 'optica/home.html')


def armazones_view(request):
    productos = Producto.objects.filter(categoria='armazon')
    serializer = ProductoSerializer(productos, many=True)
    serialized_data = JSONRenderer().render(serializer.data)
    return render(request, 'optica/armazones.html', {'productos': serialized_data})


def crear_cita(request):
    if request.method == 'POST':
        form = CitaForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = CitaForm()
    return render(request, 'optica/citas.html', {'form': form})


def registro(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            user = form.save()
            Cliente.objects.create(
                rut=user.id,  # Asumiendo que el RUT es el ID del usuario
                dv='0',  # Puedes ajustar esto según tu lógica de negocio
                nombre=user.first_name,
                apellido=user.last_name,
                email=user.email,
                telefono='912345678'  # Puedes ajustar esto según tu lógica de negocio
            )
            login(request, user)
            return redirect('perfil')
    else:
        form = RegistroForm()
    return render(request, 'optica/registro.html', {'form': form})

def iniciar_sesion(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('perfil')
            else:
                form.add_error(None, 'Correo electrónico o contraseña incorrectos')
    else:
        form = LoginForm()
    return render(request, 'optica/login.html', {'form': form})

@login_required
def perfil(request):
    return render(request, 'optica/perfil.html')

@login_required
def cerrar_sesion(request):
    logout(request)
    return redirect('home')