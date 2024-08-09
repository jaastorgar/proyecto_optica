const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    chatSocket = null;

    chatToggle.addEventListener('click', () => {
        chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
        if (chatContainer.style.display === 'block' && !chatSocket) {
            initializeChat();
        }
    });

    function initializeChat() {
        chatSocket = new WebSocket(
            'ws://' + window.location.host + '/ws/chat/'
        );

        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            const messageElement = document.createElement('div');
            messageElement.textContent = data.message;
            chatMessages.appendChild(messageElement);
        };

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        };
    }

    chatSend.onclick = function() {
        if (chatSocket && chatInput.value.trim()) {
            chatSocket.send(JSON.stringify({
                'message': chatInput.value
            }));
            chatInput.value = '';
        }
    };