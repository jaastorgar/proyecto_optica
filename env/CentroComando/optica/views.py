from django.shortcuts import render, redirect
from .models import Producto
from rest_framework.renderers import JSONRenderer
from .serializer import ProductoSerializer, CitaSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .forms import CitaForm

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
            return redirect('cita_exitosa')
    else:
        form = CitaForm()
    return render(request, 'optica/citas.html', {'form': form})