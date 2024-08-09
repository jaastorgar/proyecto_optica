from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Chat, Message, Cliente
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
import logging
logger = logging.getLogger(__name__)
User = get_user_model()

def optician_required(function):
    def wrap(request, *args, **kwargs):
        if request.user.is_staff:
            return function(request, *args, **kwargs)
        else:
            return JsonResponse({'error': 'Acceso denegado'}, status=403)
    return wrap


@login_required
@optician_required
def chat_panel(request):
    if request.user.is_staff:
        chats = Chat.objects.filter(is_active=True)
    else:
        chats = Chat.objects.filter(client=request.user, is_active=True)
    return render(request, 'chat_panel/panel.html', {'chats': chats})

@login_required
def get_chat_messages(request, chat_id):
    chat = Chat.objects.get(id=chat_id)
    messages = Message.objects.filter(chat=chat).order_by('timestamp')
    return JsonResponse([{
        'sender': msg.sender.username,
        'content': msg.content,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages], safe=False)

@csrf_exempt
@login_required
@optician_required
def create_chat(request):
    if request.method == 'POST':
        try:
            cliente_id = request.POST.get('cliente_id')
            cliente = Cliente.objects.get(id=cliente_id)
            chat = Chat.objects.create(cliente=cliente, optician=request.user)
            return JsonResponse({'chat_id': chat.id})
        except Cliente.DoesNotExist:
            return JsonResponse({'error': 'Cliente no encontrado'}, status=404)
        except Exception as e:
            logger.error(f"Error creating chat: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def close_chat(request, chat_id):
    if request.method == 'POST':
        chat = Chat.objects.get(id=chat_id)
        if request.user.is_staff or chat.client == request.user:
            chat.is_active = False
            chat.closed_at = timezone.now()
            chat.save()
            return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def search_chats(request):
    query = request.GET.get('q', '')
    if request.user.is_staff:
        chats = Chat.objects.filter(is_active=True, client__username__icontains=query)
    else:
        chats = Chat.objects.filter(client=request.user, is_active=True, id__icontains=query)
    return JsonResponse([{
        'id': chat.id,
        'client': chat.client.username,
        'created_at': chat.created_at.isoformat()
    } for chat in chats], safe=False)

@login_required
@optician_required
def assign_chat(request, chat_id):
    if request.method == 'POST':
        optician_id = request.POST.get('optician_id')
        try:
            chat = Chat.objects.get(id=chat_id)
            optician = User.objects.get(id=optician_id, is_staff=True)
            chat.assigned_to = optician
            chat.save()
            return JsonResponse({'success': True, 'optician': optician.username})
        except (Chat.DoesNotExist, User.DoesNotExist):
            return JsonResponse({'success': False, 'error': 'No se encontró el chat ni el óptico'}, status=404)
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

@login_required
@optician_required
def get_opticians(request):
    opticians = User.objects.filter(is_staff=True).values('id', 'email')
    return JsonResponse(list(opticians), safe=False)


def login_view(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        if user is not None and user.is_staff:
            login(request, user)
            return redirect('chat_panel')
        else:
            error_message = "Credenciales inválidas o usuario no autorizado."
            return render(request, 'chat_panel/login.html', {'error_message': error_message})
    return render(request, 'chat_panel/login.html')