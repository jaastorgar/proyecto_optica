from django.shortcuts import render
from .models import Producto

# Create your views here.
def home(request):
    return render(request, 'optica/home.html')


def armazones_view(request):
    productos = Producto.objects.filter(categoria='armazon')
    return render(request, 'optica/armazones.html', {'productos': productos})