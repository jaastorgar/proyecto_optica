function actualizarUICarrito(producto) {
    const contadorCarrito = document.getElementById('contador-carrito');
    if (contadorCarrito) {
        let cantidad = parseInt(contadorCarrito.textContent.replace(/[()]/g, '')) - 1;
        contadorCarrito.textContent = `(${cantidad})`;
    }

    fetch('/get_cart_total/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const subtotalElement = document.querySelector('.desglose p:nth-child(1) span');
        const ivaElement = document.querySelector('.desglose p:nth-child(2) span');
        const totalElement = document.querySelector('.total-carrito span');

        if (subtotalElement) subtotalElement.textContent = `$${data.subtotal}`;
        if (ivaElement) ivaElement.textContent = `$${data.iva}`;
        if (totalElement) totalElement.textContent = `$${data.total}`;
    })
    .catch(error => console.error('Error al actualizar el total del carrito:', error));
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

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            eliminarDelCarrito(productId);
        });
    });
});

function eliminarDelCarrito(idProducto) {
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
            const itemProducto = document.querySelector(`.item-producto[data-product-id="${idProducto}"]`);
            if (itemProducto) {
                itemProducto.remove();
            }
            actualizarUICarrito(data.producto);
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

function actualizarTotalCarrito(nuevoTotal) {
    const totalElement = document.querySelector('.total-carrito span');
    if (totalElement) {
        totalElement.textContent = `$${nuevoTotal}`;
    }
}

function actualizarCantidadCarrito(idProducto, cambio) {
    console.log('Actualizando cantidad para producto:', idProducto, 'cambio:', cambio);
    const itemProducto = document.querySelector(`.item-producto[data-product-id="${idProducto}"]`);
    if (itemProducto) {
        const cantidadElement = itemProducto.querySelector('.cantidad');
        if (cantidadElement) {
            fetch('/update_cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': obtenerCookie('csrftoken')
                },
                body: JSON.stringify({ product_id: idProducto, change: cambio })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del servidor:', data);
                if (data.success) {
                    cantidadElement.textContent = data.new_quantity;
                    actualizarTotalCarrito(data.new_total);
                    actualizarUICarrito();
                } else {
                    console.error('Error en la respuesta del servidor:', data.error);
                    mostrarMensaje('Error al actualizar la cantidad', 'error');
                }
            })
            .catch(error => {
                console.error('Error al actualizar la cantidad:', error);
                mostrarMensaje('Error al actualizar la cantidad', 'error');
            });
        }
    }
}

document.querySelectorAll('.btn-cantidad').forEach(btn => {
    btn.addEventListener('click', function() {
        const idProducto = this.dataset.productId;
        const cambio = this.classList.contains('mas') ? 1 : -1;
        actualizarCantidadCarrito(idProducto, cambio);
    });
});

function actualizarStock(idProducto, nuevoStock) {
    const productoElement = document.querySelector(`.item-producto[data-product-id="${idProducto}"]`);
    if (productoElement) {
        const stockElement = productoElement.querySelector('.stock');
        if (stockElement) {
            stockElement.textContent = `Stock: ${nuevoStock}`;
        }
    }
}

function iniciar() {
    iniciarBotonesProducto();
    actualizarUICarrito();
}

document.addEventListener('DOMContentLoaded', iniciar);