// Módulo principal de la aplicación
const App = (function() {
    const modulos = [
        moduloCarrusel,
        moduloTestimonios,
        moduloCarrito,
        moduloFiltroProductos,
        moduloVistaRapida,
        moduloProductos
    ];

    function inicializarModulos() {
        modulos.forEach(modulo => {
            if (typeof modulo.iniciar === 'function') {
                try {
                    modulo.iniciar();
                    console.log(`Módulo ${modulo.nombre || 'desconocido'} inicializado`);
                } catch (error) {
                    console.error(`Error al inicializar el módulo ${modulo.nombre || 'desconocido'}:`, error);
                }
            }
        });
    }

    function iniciar() {
        console.log('DOM completamente cargado');
        inicializarModulos();
        console.log('Todos los módulos han sido inicializados');
    }

    return { iniciar };
})();

// Módulo de gestión del estado del carrito
const moduloEstadoCarrito = (function() {
    let itemsCarrito = {};

    function actualizarUICarrito() {
        const elementoConteoCarrito = document.getElementById('conteo-carrito');
        if (elementoConteoCarrito) {
            elementoConteoCarrito.textContent = obtenerConteoCarrito();
            elementoConteoCarrito.classList.add('aparecer');
            setTimeout(() => elementoConteoCarrito.classList.remove('aparecer'), 300);
        }
    }

    return {
        agregarItem(idProducto, cantidad = 1) {
            itemsCarrito[idProducto] = (itemsCarrito[idProducto] || 0) + cantidad;
            actualizarUICarrito();
        },
        eliminarItem(idProducto) {
            if (itemsCarrito[idProducto]) {
                delete itemsCarrito[idProducto];
                actualizarUICarrito();
            }
        },
        actualizarCantidad(idProducto, cantidad) {
            cantidad > 0 ? itemsCarrito[idProducto] = cantidad : this.eliminarItem(idProducto);
            actualizarUICarrito();
        },
        obtenerItemsCarrito: () => ({...itemsCarrito}),
        obtenerConteoCarrito: () => Object.values(itemsCarrito).reduce((suma, cantidad) => suma + cantidad, 0)
    };
})();

// Módulo del carrusel
const moduloCarrusel = (function() {
    let carrusel, items, botonAnterior, botonSiguiente, indiceActual, intervalo;

    function mostrarDiapositiva(indice) {
        carrusel.style.transform = `translateX(-${indice * 100}%)`;
    }

    function siguienteDiapositiva() {
        indiceActual = (indiceActual + 1) % items.length;
        mostrarDiapositiva(indiceActual);
    }

    function diapositivaAnterior() {
        indiceActual = (indiceActual - 1 + items.length) % items.length;
        mostrarDiapositiva(indiceActual);
    }

    function iniciarDeslizamientoAutomatico() {
        intervalo = setInterval(siguienteDiapositiva, 5000);
    }

    function detenerDeslizamientoAutomatico() {
        clearInterval(intervalo);
    }

    function configurarEventListeners() {
        botonAnterior.addEventListener('click', () => {
            diapositivaAnterior();
            detenerDeslizamientoAutomatico();
            iniciarDeslizamientoAutomatico();
        });
        botonSiguiente.addEventListener('click', () => {
            siguienteDiapositiva();
            detenerDeslizamientoAutomatico();
            iniciarDeslizamientoAutomatico();
        });
        carrusel.addEventListener('mouseenter', detenerDeslizamientoAutomatico);
        carrusel.addEventListener('mouseleave', iniciarDeslizamientoAutomatico);
    }

    function iniciar() {
        carrusel = document.querySelector('.carrusel-interno');
        if (carrusel) {
            items = carrusel.querySelectorAll('.item-carrusel');
            botonAnterior = document.querySelector('.anterior');
            botonSiguiente = document.querySelector('.siguiente');
            indiceActual = 0;
            configurarEventListeners();
            iniciarDeslizamientoAutomatico();
        }
    }

    return { iniciar };
})();

// Módulo de testimonios
const moduloTestimonios = (function() {
    function iniciar() {
        const testimonios = document.querySelector('.testimonios');
        const itemsTestimonio = document.querySelectorAll('.testimonio');
        itemsTestimonio.forEach(item => {
            const clon = item.cloneNode(true);
            testimonios.appendChild(clon);
        });
    }

    return { iniciar };
})();

// Módulo del carrito de compras
const moduloCarrito = (function() {
    function agregarAlCarrito(boton, url) {
        const idProducto = boton.getAttribute('data-id-producto');
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
            if (datos.exito) {
                moduloEstadoCarrito.agregarItem(idProducto);
                alert('Producto añadido al carrito');
            } else {
                alert('Error al añadir el producto al carrito');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al añadir el producto al carrito');
        });
    }

    function obtenerCookie(nombre) {
        const valor = `; ${document.cookie}`;
        const partes = valor.split(`; ${nombre}=`);
        if (partes.length === 2) return partes.pop().split(';').shift();
    }

    function iniciar() {
        document.querySelectorAll('.agregar-al-carrito').forEach(boton => {
            boton.addEventListener('click', function() {
                const idProducto = this.getAttribute('data-id-producto');
                const urlAgregarAlCarrito = document.getElementById('url-agregar-al-carrito').value;
                agregarAlCarrito(this, urlAgregarAlCarrito);
            });
        });
    }

    return { iniciar };
})();

// Módulo de filtro de productos
const moduloFiltroProductos = (function() {
    let formularioFiltro, listaProductos, selectOrdenamiento;

    function aplicarFiltros() {
        const filtros = {
            categoria: document.getElementById('categoria').value,
            marca: document.getElementById('marca').value,
            precioMin: document.getElementById('precio_min').value,
            precioMax: document.getElementById('precio_max').value,
            genero: document.getElementById('genero').value
        };

        document.querySelectorAll('.tarjeta-producto').forEach(producto => {
            let mostrar = true;
            for (let [clave, valor] of Object.entries(filtros)) {
                if (valor && producto.dataset[clave] !== valor) {
                    mostrar = false;
                    break;
                }
            }
            producto.style.display = mostrar ? 'block' : 'none';
        });

        ordenarProductos();
    }

    function ordenarProductos() {
        const criterioOrdenamiento = selectOrdenamiento.value;
        const productos = Array.from(listaProductos.children);
        productos.sort((a, b) => {
            switch(criterioOrdenamiento) {
                case 'precio-asc':
                    return parseFloat(a.dataset.precio) - parseFloat(b.dataset.precio);
                case 'precio-desc':
                    return parseFloat(b.dataset.precio) - parseFloat(a.dataset.precio);
                case 'nombre-asc':
                    return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
                case 'nombre-desc':
                    return b.querySelector('h3').textContent.localeCompare(a.querySelector('h3').textContent);
            }
        });
        productos.forEach(producto => listaProductos.appendChild(producto));
    }

    function iniciar() {
        formularioFiltro = document.getElementById('formulario-filtro');
        listaProductos = document.getElementById('lista-productos');
        selectOrdenamiento = document.getElementById('select-ordenamiento');

        if (formularioFiltro) {
            formularioFiltro.addEventListener('submit', e => {
                e.preventDefault();
                aplicarFiltros();
            });
        }
        if (selectOrdenamiento) {
            selectOrdenamiento.addEventListener('change', ordenarProductos);
        }
    }

    return { iniciar };
})();

// Módulo de vista rápida
const moduloVistaRapida = (function() {
    let modal, contenidoModal, cerrarModal;

    function abrirVistaRapida(idProducto) {
        fetch(`/api/producto/${idProducto}/`)
            .then(respuesta => respuesta.json())
            .then(producto => {
                contenidoModal.innerHTML = `
                    <h2>${producto.armazon}</h2>
                    <img src="${producto.imagen}" alt="${producto.armazon}">
                    <p>${producto.caracteristica}</p>
                    <p>Precio: $${producto.precio}</p>
                    <button class="btn agregar-al-carrito" data-id-producto="${producto.codigo}">Añadir al carrito</button>
                `;
                modal.style.display = "block";
            })
            .catch(error => {
                console.error('Error:', error);
                contenidoModal.innerHTML = '<p>Error al cargar los detalles del producto.</p>';
                modal.style.display = "block";
            });
    }

    function cerrarVistaRapida() {
        modal.style.display = "none";
    }

    function iniciar() {
        modal = document.getElementById('modal-vista-rapida');
        contenidoModal = document.getElementById('contenido-vista-rapida');
        cerrarModal = document.getElementsByClassName('cerrar')[0];

        document.querySelectorAll('.ver-rapido').forEach(boton => {
            boton.addEventListener('click', function() {
                abrirVistaRapida(this.getAttribute('data-id-producto'));
            });
        });

        cerrarModal.onclick = cerrarVistaRapida;
        window.onclick = evento => {
            if (evento.target == modal) cerrarVistaRapida();
        };
    }

    return { iniciar };
})();

// Módulo de productos
const moduloProductos = (function() {
    function animarProductos() {
        document.querySelectorAll('.tarjeta-producto').forEach((producto, indice) => {
            producto.classList.add('deslizar-arriba');
            setTimeout(() => producto.classList.add('mostrar'), indice * 100);
        });
    }

    function iniciarCargaPerezosa() {
        const imagenesPerezosas = document.querySelectorAll('img.carga-perezosa');
        const observadorImagen = new IntersectionObserver((entradas, observador) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    const img = entrada.target;
                    img.src = img.dataset.src;
                    img.classList.remove('carga-perezosa');
                    observador.unobserve(img);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 });

        imagenesPerezosas.forEach(img => observadorImagen.observe(img));
    }

    function iniciar() {
        animarProductos();
        iniciarCargaPerezosa();
    }

    return { iniciar };
})();

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', App.iniciar);