from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Producto, Cliente, Cita
from .forms import CitaForm, ClienteForm, CustomPasswordResetForm
from django.contrib.auth import authenticate, login, logout
from .forms import RegistroForm, LoginForm
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
from django.urls import reverse_lazy
from django.core.paginator import Paginator

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
            cita = form.save(commit=False)
            if request.user.is_authenticated:
                cita.cliente = request.user.cliente
            cita.save()
            return redirect('mis_citas')
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
                if user.is_customer:
                    return redirect('home')
                else:
                    return redirect('admin:index')
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
        user.first_name = request.POST['nombre']
        user.last_name = request.POST['apellido']
        user.save()

        cliente, created = Cliente.objects.get_or_create(user=user)
        cliente.rut = request.POST.get('rut')
        cliente.dv = request.POST.get('dv')
        cliente.nombre = request.POST.get('nombre')
        cliente.apellido = request.POST.get('apellido')
        cliente.telefono = request.POST.get('telefono')
        cliente.save()

        messages.success(request, 'Perfil actualizado exitosamente.')
        return redirect('login')
    return render(request, 'optica/perfil.html')

@login_required
def mis_citas(request):
    citas_pendientes = Cita.objects.filter(cliente=request.user.cliente, estado='pendiente')
    citas_confirmadas = Cita.objects.filter(cliente=request.user.cliente, estado='confirmada')
    citas_canceladas = Cita.objects.filter(cliente=request.user.cliente, estado='cancelada')
    citas = Cita.objects.filter(cliente=request.user.cliente)

    paginator = Paginator(citas, 10)  # 10 citas por página
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    fecha = request.GET.get('fecha')
    estado = request.GET.get('estado')

    if fecha:
        citas = citas.filter(fecha_hora__date=fecha)
    if estado:
        citas = citas.filter(estado=estado)
    
    context = {
        'page_obj': page_obj,
        'citas_pendientes': citas_pendientes,
        'citas_confirmadas': citas_confirmadas,
        'citas_canceladas': citas_canceladas,
    }
    
    return render(request, 'optica/mis_citas.html', context)

@login_required
def citas_list(request):
    citas = Cita.objects.filter(cliente=request.user.cliente)
    return render(request, 'optica/citas_list.html', {'citas': citas})


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
        
        try:
            producto = Producto.objects.get(codigo=product_id)
            if producto.stock > 0:
                carrito[product_id] = carrito.get(product_id, 0) + 1
                producto.stock -= 1
                producto.save()
                request.session['carrito'] = carrito
                return JsonResponse({'message': 'Producto añadido al carrito', 'stock': producto.stock})
            else:
                return JsonResponse({'error': 'Producto sin stock'}, status=400)
        except Producto.DoesNotExist:
            return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

class CustomPasswordResetView(PasswordResetView):
    template_name = 'optica/password_reset.html'
    form_class = CustomPasswordResetForm
    success_url = reverse_lazy('password_reset_done')

class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'optica/password_reset_done.html'

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'optica/password_reset_confirm.html'
    success_url = reverse_lazy('password_reset_complete')

class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'optica/password_reset_complete.html'


def detalle_producto(request, codigo):
    try:
        producto = Producto.objects.get(codigo=codigo)
        data = {
            'codigo': producto.codigo,
            'armazon': producto.armazon,
            'caracteristica': producto.caracteristica,
            'precio': str(producto.precio),
            'imagen': producto.imagen.url if producto.imagen else '',
        }
        return JsonResponse(data)
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)


@csrf_exempt
def remove_from_cart(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        product_id = data.get('product_id')
        carrito = request.session.get('carrito', {})
        
        try:
            producto = Producto.objects.get(codigo=product_id)
            if product_id in carrito:
                carrito[product_id] -= 1
                if carrito[product_id] <= 0:
                    del carrito[product_id]
                producto.stock += 1
                producto.save()
                request.session['carrito'] = carrito
                return JsonResponse({'message': 'Producto eliminado del carrito', 'stock': producto.stock})
            return JsonResponse({'error': 'Producto no encontrado en el carrito'}, status=404)
        except Producto.DoesNotExist:
            return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def cancelar_cita(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        cita_id = data.get('cita_id')
        try:
            cita = Cita.objects.get(id=cita_id)
            cita.estado = 'cancelada'
            cita.save()
            return redirect('mis_citas')
        except Cita.DoesNotExist:
            return redirect('mis_citas')
    return redirect('mis_citas')

def reprogramar_cita(request, cita_id):
    try:
        cita = Cita.objects.get(id=cita_id)
        if request.method == 'POST':
            form = CitaForm(request.POST, instance=cita)
            if form.is_valid():
                form.save()
                return redirect('mis_citas')
        else:
            form = CitaForm(instance=cita)
            form.fields['nombre'].widget.attrs['readonly'] = True
            form.fields['email'].widget.attrs['readonly'] = True
            form.fields['telefono'].widget.attrs['readonly'] = True
            form.fields['motivo'].widget.attrs['readonly'] = True
        return render(request, 'optica/reprogramar_cita.html', {'form': form})
    except Cita.DoesNotExist:
        return redirect('mis_citas')