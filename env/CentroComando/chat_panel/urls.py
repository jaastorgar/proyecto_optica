from django.urls import path
from .views import chat_panel, get_chat_messages, create_chat, close_chat, search_chats, assign_chat, get_opticians, login_view

urlpatterns = [
    path('panel/', chat_panel, name='chat_panel'),
    path('messages/<int:chat_id>/', get_chat_messages, name='get_chat_messages'),
    path('create/', create_chat, name='create_chat'),
    path('close/<int:chat_id>/', close_chat, name='close_chat'),
    path('search/', search_chats, name='search_chats'),
    path('assign/<int:chat_id>/', assign_chat, name='assign_chat'),
    path('get_opticians/', get_opticians, name='get_opticians'),
    path('login/', login_view, name='login_optican'),
]