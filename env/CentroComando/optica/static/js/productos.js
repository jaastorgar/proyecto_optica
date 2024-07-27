let paginaActual = 1;
let totalProductos = 0;
const productosPorPagina = 12;

function iniciarPaginacion() {
    totalProductos = document.querySelectorAll('.product-card').length;
    actualizarPaginacion();
    mostrarProductosPagina(1);
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
    const paginacionContainer = document.getElementById('pagination');
    if (paginacionContainer) {
        paginacionContainer.innerHTML = '';
        for (let i = 1; i <= totalPaginas; i++) {
            const botonPagina = document.createElement('button');
            botonPagina.textContent = i;
            botonPagina.addEventListener('click', () => mostrarProductosPagina(i));
            paginacionContainer.appendChild(botonPagina);
        }
    }
}

function mostrarProductosPagina(pagina) {
    const productos = document.querySelectorAll('.product-card');
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    productos.forEach((producto, index) => {
        producto.style.display = (index >= inicio && index < fin) ? 'block' : 'none';
    });
    paginaActual = pagina;
}

function iniciarCargaPerezosa() {
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const img = entrada.target;
                img.src = img.dataset.src;
                observador.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img[data-src]').forEach(img => observador.observe(img));
}

function iniciarFiltros() {
    const formularioFiltro = document.getElementById('filter-form');
    const selectOrdenamiento = document.getElementById('sort-select');
    if (formularioFiltro) {
        formularioFiltro.addEventListener('submit', aplicarFiltros);
    }
    if (selectOrdenamiento) {
        selectOrdenamiento.addEventListener('change', ordenarProductos);
    }
}

function aplicarFiltros(event) {
    event.preventDefault();
    const categoria = document.getElementById('categoria').value;
    const marca = document.getElementById('marca').value;
    const precioMin = document.getElementById('precio_min').value;
    const precioMax = document.getElementById('precio_max').value;
    const genero = document.getElementById('genero').value;

    const productos = document.querySelectorAll('.product-card');
    productos.forEach(producto => {
        const cumpleFiltros = (
            (categoria === '' || producto.dataset.categoria === categoria) &&
            (marca === '' || producto.dataset.marca === marca) &&
            (genero === '' || producto.dataset.genero === genero) &&
            (precioMin === '' || parseFloat(producto.dataset.precio) >= parseFloat(precioMin)) &&
            (precioMax === '' || parseFloat(producto.dataset.precio) <= parseFloat(precioMax))
        );
        producto.style.display = cumpleFiltros ? 'block' : 'none';
    });

    actualizarPaginacion();
}

function ordenarProductos() {
    const criterio = document.getElementById('sort-select').value;
    const productos = Array.from(document.querySelectorAll('.product-card'));
    const contenedorProductos = document.getElementById('products-list');

    productos.sort((a, b) => {
        switch (criterio) {
            case 'price-asc':
                return parseFloat(a.dataset.precio) - parseFloat(b.dataset.precio);
            case 'price-desc':
                return parseFloat(b.dataset.precio) - parseFloat(a.dataset.precio);
            case 'name-asc':
                return a.dataset.nombre.localeCompare(b.dataset.nombre);
            case 'name-desc':
                return b.dataset.nombre.localeCompare(a.dataset.nombre);
            default:
                return 0;
        }
    });

    productos.forEach(producto => contenedorProductos.appendChild(producto));
    actualizarPaginacion();
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

    document.querySelectorAll('.view-quick').forEach(boton => {
        boton.addEventListener('click', function() {
            const idProducto = this.dataset.productId;
            mostrarVistaRapida(idProducto);
        });
    });
}

function mostrarVistaRapida(idProducto) {
    const modal = document.getElementById('quick-view-modal');
    const contenidoModal = document.getElementById('quick-view-content');
    fetch(`/producto/${idProducto}/`)
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error('La respuesta de la red no fue satisfactoria');
            }
            return respuesta.json();
        })
        .then(producto => {
            contenidoModal.innerHTML = `
                <h2>${producto.armazon}</h2>
                <img src="${producto.imagen}" alt="${producto.armazon}">
                <p>${producto.caracteristica}</p>
                <p class="price">$${producto.precio}</p>
                <button class="btn add-to-cart" data-product-id="${producto.codigo}">Añadir al carrito</button>
            `;
            modal.style.display = 'block';
            const botonAñadir = contenidoModal.querySelector('.add-to-cart');
            botonAñadir.addEventListener('click', () => agregarAlCarrito(idProducto));
        })
        .catch(error => {
            console.error('Error:', error);
            contenidoModal.innerHTML = '<p>Error al cargar los datos del producto.</p>';
            modal.style.display = 'block';
        });
    const cerrarModal = document.querySelector('.close');
    cerrarModal.onclick = () => modal.style.display = 'none';
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

function mostrarMensaje(mensaje, tipo) {
    const contenedorMensaje = document.createElement('div');
    contenedorMensaje.className = `mensaje ${tipo}`;
    contenedorMensaje.textContent = mensaje;
    document.body.appendChild(contenedorMensaje);
    setTimeout(() => {
        contenedorMensaje.remove();
    }, 3000);
}

function iniciar() {
    iniciarPaginacion();
    iniciarCargaPerezosa();
    iniciarFiltros();
    iniciarBotonesProducto();
    actualizarUICarrito();
}

document.addEventListener('DOMContentLoaded', iniciar);