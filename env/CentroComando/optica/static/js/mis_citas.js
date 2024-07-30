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
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));

            this.classList.add('active');
            document.getElementById(target).classList.remove('hidden');
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarBotonesReprogramar();
    iniciarPestanas();
});