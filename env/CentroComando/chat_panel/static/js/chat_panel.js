let activeChatId = null;

const chatSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/chat_panel/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.chat_id !== activeChatId) {
        showNotification(`Nuevo mensaje en Chat ${data.chat_id}`);
    }
    updateChatPanel(data);
};

function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification(message);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }
}

chatSocket.onclose = function(e) {
    console.error('El socket de chat se cerró inesperadamente');
};

function updateChatPanel(data) {
    const chatList = document.getElementById('chat-list');
    const messageContainer = document.getElementById('message-container');

    if (!document.getElementById(`chat-${data.chat_id}`)) {
        const chatItem = createChatListItem(data.chat_id);
        chatList.appendChild(chatItem);
    }

    if (data.chat_id === activeChatId) {
        appendMessage(data.username, data.message);
    }
}

function createChatListItem(chatId) {
    const chatItem = document.createElement('li');
    chatItem.id = `chat-${chatId}`;
    chatItem.textContent = `Chat ${chatId}`;
    chatItem.onclick = () => selectChat(chatId);
    return chatItem;
}

function appendMessage(username, message) {
    const messageContainer = document.getElementById('message-container');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = `${username}: ${message}`;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

document.querySelector('#send-message').onclick = sendMessage;

function sendMessage() {
    const messageInputDom = document.querySelector('#chat-input');
    const message = messageInputDom.value;
    if (message.trim() && activeChatId) {
        chatSocket.send(JSON.stringify({
            'message': message,
            'chat_id': activeChatId
        }));
        messageInputDom.value = '';
    }
}

function selectChat(chatId) {
    activeChatId = chatId;
    document.querySelectorAll('#chat-list li').forEach(li => li.classList.remove('active'));
    document.getElementById(`chat-${chatId}`).classList.add('active');
    document.getElementById('current-chat-title').textContent = `Chat ${chatId}`;
    document.getElementById('close-chat-btn').style.display = 'block';
    loadChatMessages(chatId);
}

function loadChatMessages(chatId) {
    fetch(`/chat/messages/${chatId}/`)
        .then(response => response.json())
        .then(messages => {
            const messageContainer = document.getElementById('message-container');
            messageContainer.innerHTML = '';
            messages.forEach(msg => appendMessage(msg.sender, msg.content));
        });
}

document.querySelector('#new-chat-btn').onclick = createNewChat;

function createNewChat() {
    fetch('/chat/create/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => Promise.reject(data));
        }
        return response.json();
    })
    .then(data => {
        if (data.chat_id) {
            const chatItem = createChatListItem(data.chat_id);
            document.getElementById('chat-list').appendChild(chatItem);
            selectChat(data.chat_id);
        }
    })
    .catch(error => {
        console.error('Error creating chat:', error);
    });
}

document.querySelector('#close-chat-btn').onclick = closeCurrentChat;

function closeCurrentChat() {
    if (activeChatId) {
        fetch(`/chat/close/${activeChatId}/`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(`chat-${activeChatId}`).remove();
                    activeChatId = null;
                    document.getElementById('message-container').innerHTML = '';
                    document.getElementById('current-chat-title').textContent = 'Selecciona un chat';
                    document.getElementById('close-chat-btn').style.display = 'none';
                }
            });
    }
}

document.querySelector('#chat-search').oninput = searchChats;

function searchChats(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('#chat-list li').forEach(li => {
        const chatName = li.textContent.toLowerCase();
        li.style.display = chatName.includes(searchTerm) ? 'block' : 'none';
    });
}

function showNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function assignChat(chatId, opticianId) {
    fetch(`/chat/assign/${chatId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: `optician_id=${opticianId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateChatAssignment(chatId, data.optician);
            showNotification(`Chat ${chatId} asignado a ${data.optician}`);
        } else {
            showNotification('Error al asignar el chat', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error al asignar el chat', 'error');
    });
}

function updateChatAssignment(chatId, opticianName) {
    const chatItem = document.getElementById(`chat-${chatId}`);
    if (chatItem) {
        const assignmentInfo = chatItem.querySelector('.assignment-info') || document.createElement('span');
        assignmentInfo.className = 'assignment-info';
        assignmentInfo.textContent = `Asignado a: ${opticianName}`;
        chatItem.appendChild(assignmentInfo);
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener('DOMContentLoaded', function() {
    const chats = document.querySelectorAll('#chat-list li');
    if (chats.length > 0) {
        selectChat(chats[0].id.split('-')[1]);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    loadOpticians();
    document.getElementById('assign-chat-btn').addEventListener('click', handleChatAssignment);
});

function loadOpticians() {
    fetch('/chat/get_opticians/')
        .then(response => {
            if (!response.ok) {
                throw new Error('La respuesta de la red no fue satisfactoria');
            }
            return response.json();
        })
        .then(opticians => {
            const select = document.getElementById('optician-select');
            opticians.forEach(optician => {
                const option = document.createElement('option');
                option.value = optician.id;
                option.textContent = optician.email; // Cambiado de username a email
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar los ópticos:', error);
            showNotification('Error al cargar la lista de ópticos', 'error');
        });
}

function handleChatAssignment() {
    const opticianId = document.getElementById('optician-select').value;
    if (activeChatId && opticianId) {
        assignChat(activeChatId, opticianId);
    } else {
        showNotification('Por favor, selecciona un chat y un óptico', 'warning');
    }
}