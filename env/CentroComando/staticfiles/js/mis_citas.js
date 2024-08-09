function obtenerCookie(nombre) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, nombre.length + 1) === (nombre + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(nombre.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function mostrarMensaje(mensaje, tipo) {
    const contenedorMensaje = document.createElement('div');
    contenedorMensaje.className = `mensaje ${tipo}`;
    contenedorMensaje.textContent = mensaje;
    document.body.appendChild(contenedorMensaje);
    setTimeout(() => {
        contenedorMensaje.remove();
    }, 3000);
}

function reprogramarCita(citaId) {
    window.location.href = `/reprogramar_cita/${citaId}/`;
}

function iniciarBotonesReprogramar() {
    console.log('Iniciando botones de reprogramar');
    document.querySelectorAll('.reprogramar-cita').forEach(boton => {
        boton.addEventListener('click', function() {
            console.log('Botón de reprogramar clickeado');
            const citaId = this.dataset.citaId;
            reprogramarCita(citaId);
        });
    });
}

function iniciarPestanas() {
    console.log('Iniciando pestañas');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Tabs encontradas:', tabs.length);
    console.log('Contenidos de tab encontrados:', tabContents.length);

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            console.log('Tab clickeada:', this.getAttribute('data-tab'));
            const target = this.getAttribute('data-tab');

            tabs.forEach(t => {
                t.classList.remove('active');
                console.log('Removiendo clase active de:', t.getAttribute('data-tab'));
            });
            tabContents.forEach(content => {
                content.style.display = 'none';
                console.log('Ocultando contenido:', content.id);
            });

            this.classList.add('active');
            console.log('Añadiendo clase active a:', target);
            const targetContent = document.getElementById(target);
            if (targetContent) {
                targetContent.style.display = 'block';
                console.log('Mostrando contenido:', target);
            } else {
                console.log('No se encontró el contenido para:', target);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarBotonesReprogramar();
    iniciarPestanas();
});