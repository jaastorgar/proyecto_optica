import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat_panel.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CentroComando.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat_panel.routing.websocket_urlpatterns
        )
    ),
})