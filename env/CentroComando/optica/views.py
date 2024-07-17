from django.shortcuts import render
from .models import Producto
from rest_framework.renderers import JSONRenderer
from .serializer import ProductoSerializer

# Create your views here.
def home(request):
    return render(request, 'optica/home.html')


def armazones_view(request):
    productos = Producto.objects.filter(categoria='armazon')
    serializer = ProductoSerializer(productos, many=True)
    serialized_data = JSONRenderer().render(serializer.data)
    return render(request, 'optica/armazones.html', {'productos': serialized_data})