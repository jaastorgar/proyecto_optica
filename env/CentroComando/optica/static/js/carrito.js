const moduloCarrito = (function() {
    let itemsCarrito = {};

    function actualizarUICarrito() {
        const elementoConteoCarrito = document.getElementById('conteo-carrito');
        if (elementoConteoCarrito) {
            elementoConteoCarrito.textContent = obtenerConteoCarrito();
            elementoConteoCarrito.classList.add('aparecer');
            setTimeout(() => elementoConteoCarrito.classList.remove('aparecer'), 300);
        }
    }

    function agregarAlCarrito(idProducto) {
        console.log('Intentando agregar producto:', idProducto);
        const url = 'add-to-cart/';
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': obtenerCookie('csrftoken')
            },
            body: JSON.stringify({ id_producto: idProducto })
        })
        .then(respuesta => respuesta.json())
        .then(datos => {
            console.log('Respuesta del servidor:', datos);
            if (datos.exito) {
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

    function agregarItem(idProducto, cantidad = 1) {
        itemsCarrito[idProducto] = (itemsCarrito[idProducto] || 0) + cantidad;
        actualizarUICarrito();
    }

    function eliminarItem(idProducto) {
        if (itemsCarrito[idProducto]) {
            delete itemsCarrito[idProducto];
            actualizarUICarrito();
        }
    }

    function obtenerConteoCarrito() {
        return Object.values(itemsCarrito).reduce((suma, cantidad) => suma + cantidad, 0);
    }

    function obtenerCookie(nombre) {
        const valor = `; ${document.cookie}`;
        const partes = valor.split(`; ${nombre}=`);
        if (partes.length === 2) return partes.pop().split(';').shift();
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
            document.querySelectorAll('.add-to-cart').forEach(boton => {
                boton.addEventListener('click', () => agregarAlCarrito(boton.dataset.productId));
            });
        },
        agregarAlCarrito: agregarAlCarrito
    };
})();

document.addEventListener('DOMContentLoaded', moduloCarrito.iniciar);