const moduloCitas = (function() {
    function inicializarFormularioCita() {
        const formulario = document.getElementById('cita-form');
        if (formulario) {
            formulario.addEventListener('submit', crearCita);
        }
    }

    function crearCita(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        fetch('/crear_cita/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': obtenerCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('Cita agendada con éxito', 'success');
                limpiarFormulario(event.target);
            } else {
                mostrarMensaje('Error al agendar la cita', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error al agendar la cita', 'error');
        });
    }

    function limpiarFormulario(formulario) {
        formulario.reset();
    }

    function inicializarTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', cambiarTab);
        });
    }

    function cambiarTab(event) {
        const tabSeleccionado = event.target;
        const tabs = document.querySelectorAll('.tab');
        const contenidoTabs = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => tab.classList.remove('active'));
        contenidoTabs.forEach(contenido => contenido.classList.remove('active'));

        tabSeleccionado.classList.add('active');
        document.getElementById(tabSeleccionado.dataset.tab).classList.add('active');
    }

    function obtenerCookie(name) {
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

    function mostrarMensaje(mensaje, tipo) {
        const contenedorMensaje = document.createElement('div');
        contenedorMensaje.className = `mensaje ${tipo}`;
        contenedorMensaje.textContent = mensaje;
        document.body.appendChild(contenedorMensaje);
        setTimeout(() => {
            contenedorMensaje.remove();
        }, 3000);
    }

    return {
        iniciar: function() {
            inicializarFormularioCita();
            inicializarTabs();
        }
    };
})();

document.addEventListener('DOMContentLoaded', moduloCitas.iniciar);