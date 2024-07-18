from django.http import JsonResponse
from django.shortcuts import render, redirect
from .models import Producto
from rest_framework.renderers import JSONRenderer
from .serializer import ProductoSerializer
from .forms import CitaForm, ClienteForm
from django.contrib.auth import authenticate, login, logout
from .forms import RegistroForm, LoginForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json

# Create your views here.
def home(request):
    return render(request, 'optica/home.html')


def productos_view(request):
    query = request.GET.get('q')
    if query:
        productos = Producto.objects.filter(armazon__icontains=query)
    else:
        productos = Producto.objects.all()
    return render(request, 'optica/productos.html', {'productos': productos})


def crear_cita(request):
    if request.method == 'POST':
        form = CitaForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = CitaForm()
    return render(request, 'optica/citas.html', {'form': form})


def registro_cliente(request):
    if request.method == 'POST':
        user_form = RegistroForm(request.POST)
        cliente_form = ClienteForm(request.POST)
        if user_form.is_valid() and cliente_form.is_valid():
            user = user_form.save()
            cliente = cliente_form.save(commit=False)
            cliente.user = user
            cliente.save()
            login(request, user)
            return redirect('home')
    else:
        user_form = RegistroForm()
        cliente_form = ClienteForm()
    return render(request, 'optica/registro.html', {'user_form': user_form, 'cliente_form': cliente_form})

def iniciar_sesion(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                form.add_error(None, 'Correo electrónico o contraseña incorrectos')
    else:
        form = LoginForm()
    return render(request, 'optica/login.html', {'form': form})

@login_required
def perfil(request):
    return render(request, 'optica/perfil.html')

@login_required
def actualizar_perfil(request):
    if request.method == 'POST':
        user = request.user
        user.email = request.POST['email']
        user.save()

        cliente = user.cliente
        cliente.rut = request.POST['rut']
        cliente.nombre = request.POST['nombre']
        cliente.apellido = request.POST['apellido']
        cliente.telefono = request.POST['telefono']
        cliente.direccion = request.POST['direccion']
        cliente.save()

        return redirect('perfil')
    return render(request, 'optica/perfil.html')

@login_required
def cerrar_sesion(request):
    logout(request)
    return redirect('home')


def carrito_view(request):
    carrito = request.session.get('carrito', {})
    productos = Producto.objects.filter(codigo__in=carrito.keys())
    total = sum(producto.precio * cantidad for producto, cantidad in zip(productos, carrito.values()))
    return render(request, 'optica/carrito.html', {'productos': productos, 'total': total})

def checkout_view(request):
    # Lógica para la vista de checkout
    return render(request, 'optica/checkout.html')

@csrf_exempt
def add_to_cart(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        product_id = data.get('product_id')
        carrito = request.session.get('carrito', {})
        if product_id in carrito:
            carrito[product_id] += 1
        else:
            carrito[product_id] = 1
        request.session['carrito'] = carrito
        return JsonResponse({'message': 'Producto añadido al carrito'})
    return JsonResponse({'error': 'Método no permitido'}, status=405)