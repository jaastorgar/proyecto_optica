function actualizarUICarrito() {
    fetch('/carrito/', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => {
            if (!response.ok) {
                throw new Error('La respuesta del servidor no fue exitosa');
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const contadorCarrito = doc.querySelector('#contador-carrito');
            if (contadorCarrito) {
                const carritoElement = document.getElementById('carrito');
                if (carritoElement) {
                    carritoElement.innerHTML = `Carrito ${contadorCarrito.textContent}`;
                }
            }
        })
        .catch(error => {
            console.error('Error al actualizar el carrito:', error);
        });
}

function agregarAlCarrito(idProducto) {
    console.log('Añadiendo al carrito:', idProducto);
    fetch('/add_to_cart/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': obtenerCookie('csrftoken')
        },
        body: JSON.stringify({ product_id: idProducto })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Producto añadido al carrito') {
            actualizarUICarrito();
            mostrarMensaje('Producto añadido al carrito', 'exito');
        } else {
            mostrarMensaje('Error al añadir el producto al carrito', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al añadir el producto al carrito', 'error');
    });
}

function eliminarDelCarrito(idProducto) {
    console.log('Eliminando del carrito:', idProducto);
    fetch('/remove_from_cart/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': obtenerCookie('csrftoken')
        },
        body: JSON.stringify({ product_id: idProducto })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Producto eliminado del carrito') {
            actualizarUICarrito();
            mostrarMensaje('Producto eliminado del carrito', 'exito');
        } else {
            mostrarMensaje('Error al eliminar el producto del carrito', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar el producto del carrito', 'error');
    });
}

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

function iniciarBotonesProducto() {
    document.querySelectorAll('.add-to-cart').forEach(boton => {
        boton.addEventListener('click', function() {
            if (!this.disabled) {
                const idProducto = this.dataset.productId;
                agregarAlCarrito(idProducto);
            }
        });
    });

    document.querySelectorAll('.remove-from-cart').forEach(boton => {
        boton.addEventListener('click', function() {
            const idProducto = this.dataset.productId;
            eliminarDelCarrito(idProducto);
        });
    });
}

function iniciar() {
    iniciarBotonesProducto();
    actualizarUICarrito();
}

document.addEventListener('DOMContentLoaded', iniciar);