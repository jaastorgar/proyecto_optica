// Módulos individuales
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

    return {
        iniciar() {
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
    };
})();

const moduloTestimonios = (function() {
    return {
        iniciar() {
            const testimonios = document.querySelector('.testimonios');
            const itemsTestimonio = document.querySelectorAll('.testimonio');
            itemsTestimonio.forEach(item => {
                const clon = item.cloneNode(true);
                testimonios.appendChild(clon);
            });
        }
    };
})();

const moduloCarrito = (function() {
    function agregarAlCarrito(idProducto) {
        const url = document.getElementById('add-to-cart-url').value;
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

    function actualizarUICarrito() {
        const conteoCarrito = document.getElementById('cart-count');
        if (conteoCarrito) {
            conteoCarrito.textContent = moduloEstadoCarrito.obtenerConteoCarrito();
        }
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

    function obtenerCookie(nombre) {
        const valor = `; ${document.cookie}`;
        const partes = valor.split(`; ${nombre}=`);
        if (partes.length === 2) return partes.pop().split(';').shift();
    }

    return {
        iniciar() {
            document.querySelectorAll('.add-to-cart').forEach(boton => {
                boton.addEventListener('click', () => agregarAlCarrito(boton.dataset.productId));
            });
        },
        agregarAlCarrito // Exponemos esta función para usarla en otros módulos
    };
})();

const moduloFiltroProductos = (function() {
    let formularioFiltro, listaProductos, selectOrdenamiento;
    let productosCache = [];

    function cargarProductosEnCache() {
        productosCache = Array.from(document.querySelectorAll('.product-card')).map(card => ({
            elemento: card,
            categoria: card.dataset.category,
            marca: card.dataset.brand,
            precio: parseFloat(card.dataset.price),
            genero: card.dataset.gender,
            nombre: card.querySelector('h3').textContent
        }));
    }

    function aplicarFiltros() {
        const filtros = obtenerFiltrosActuales();
        const productosFiltrados = productosCache.filter(producto => 
            (!filtros.categoria || producto.categoria === filtros.categoria) &&
            (!filtros.marca || producto.marca === filtros.marca) &&
            (producto.precio >= filtros.precioMin && producto.precio <= filtros.precioMax) &&
            (!filtros.genero || producto.genero === filtros.genero)
        );

        actualizarVistaProductos(productosFiltrados);
        ordenarProductos(productosFiltrados);
    }

    function obtenerFiltrosActuales() {
        return {
            categoria: document.getElementById('categoria').value,
            marca: document.getElementById('marca').value,
            precioMin: parseFloat(document.getElementById('precio_min').value) || 0,
            precioMax: parseFloat(document.getElementById('precio_max').value) || Infinity,
            genero: document.getElementById('genero').value
        };
    }

    function actualizarVistaProductos(productos) {
        listaProductos.innerHTML = '';
        productos.forEach(producto => listaProductos.appendChild(producto.elemento));
    }

    function ordenarProductos(productos) {
        const criterio = selectOrdenamiento.value;
        const [propiedad, orden] = criterio.split('-');
        productos.sort((a, b) => {
            const valorA = propiedad === 'precio' ? a.precio : a.nombre;
            const valorB = propiedad === 'precio' ? b.precio : b.nombre;
            return orden === 'asc' ? valorA - valorB : valorB - valorA;
        });
        actualizarVistaProductos(productos);
    }

    return {
        iniciar() {
            formularioFiltro = document.getElementById('filter-form');
            listaProductos = document.getElementById('products-list');
            selectOrdenamiento = document.getElementById('sort-select');

            cargarProductosEnCache();

            if (formularioFiltro) {
                formularioFiltro.addEventListener('submit', e => {
                    e.preventDefault();
                    aplicarFiltros();
                });
            }
            if (selectOrdenamiento) {
                selectOrdenamiento.addEventListener('change', () => ordenarProductos(productosCache));
            }
        }
    };
})();

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
                    <button class="btn add-to-cart" data-product-id="${producto.codigo}">Añadir al carrito</button>
                `;
                modal.style.display = "block";
                const botonAgregarCarrito = contenidoModal.querySelector('.add-to-cart');
                if (botonAgregarCarrito) {
                    botonAgregarCarrito.addEventListener('click', () => moduloCarrito.agregarAlCarrito(producto.codigo));
                }
            })
            .catch(error => {
                console.error('Error al cargar los detalles del producto:', error);
                contenidoModal.innerHTML = '<p>Error al cargar los detalles del producto.</p>';
                modal.style.display = "block";
            });
    }

    function cerrarVistaRapida() {
        modal.style.display = "none";
    }

    return {
        iniciar() {
            modal = document.getElementById('quick-view-modal');
            contenidoModal = document.getElementById('quick-view-content');
            cerrarModal = modal ? modal.querySelector('.close') : null;

            if (cerrarModal) {
                cerrarModal.addEventListener('click', cerrarVistaRapida);
            }

            document.querySelectorAll('.view-quick').forEach(boton => {
                boton.addEventListener('click', () => abrirVistaRapida(boton.dataset.productId));
            });

            if (modal) {
                window.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        cerrarVistaRapida();
                    }
                });
            }
        }
    };
})();

const moduloProductos = (function() {
    const productosPorPagina = 12;
    let paginaActual = 1;
    let totalProductos = 0;

    function iniciarPaginacion() {
        totalProductos = document.querySelectorAll('.product-card').length;
        actualizarPaginacion();
        mostrarProductosPagina(1);
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
        // Implementa aquí la lógica de carga perezosa
        // Por ejemplo:
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

    function animarProductos() {
        // Implementa aquí la lógica de animación de productos
    }

    return {
        iniciar() {
            iniciarCargaPerezosa();
            animarProductos();
            iniciarPaginacion();
        }
    };
})();

const moduloAccesibilidad = (function() {
    function mejorarNavegacionTeclado() {
        const elementosInteractivos = document.querySelectorAll('a, button, input, select');
        elementosInteractivos.forEach(elemento => {
            elemento.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    elemento.click();
                }
            });
        });
    }

    return {
        iniciar() {
            mejorarNavegacionTeclado();
        }
    };
})();

const moduloBusquedaEnTiempoReal = (function() {
    let inputBusqueda, listaProductos;

    function buscarProductos(termino) {
        const productos = document.querySelectorAll('.product-card');
        productos.forEach(producto => {
            const nombre = producto.querySelector('h3').textContent.toLowerCase();
            const descripcion = producto.querySelector('p').textContent.toLowerCase();
            const coincide = nombre.includes(termino) || descripcion.includes(termino);
            producto.style.display = coincide ? 'block' : 'none';
        });
    }

    return {
        iniciar() {
            inputBusqueda = document.getElementById('search-input');
            listaProductos = document.getElementById('products-list');

            if (inputBusqueda) {
                inputBusqueda.addEventListener('input', (e) => {
                    const termino = e.target.value.toLowerCase();
                    buscarProductos(termino);
                });
            }
        }
    };
})();

const moduloRecomendaciones = (function() {
    let productosVistos = [];

    function registrarProductoVisto(idProducto) {
        if (!productosVistos.includes(idProducto)) {
            productosVistos.push(idProducto);
            if (productosVistos.length > 5) {
                productosVistos.shift();
            }
            localStorage.setItem('productosVistos', JSON.stringify(productosVistos));
        }
    }

    function obtenerRecomendaciones() {
        const productosRecomendados = productosVistos.map(id => {
            return document.querySelector(`.product-card[data-product-id="${id}"]`);
        }).filter(Boolean);

        const contenedorRecomendaciones = document.getElementById('recomendaciones');
        contenedorRecomendaciones.innerHTML = '';
        productosRecomendados.forEach(producto => {
            const clon = producto.cloneNode(true);
            contenedorRecomendaciones.appendChild(clon);
        });
    }

    return {
        iniciar() {
            productosVistos = JSON.parse(localStorage.getItem('productosVistos')) || [];
            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', () => registrarProductoVisto(card.dataset.productId));
            });
            obtenerRecomendaciones();
        }
    };
})();

const moduloCargaProgresiva = (function() {
    let paginaActual = 1;
    const productosPorPagina = 12;
    let cargando = false;

    function cargarMasProductos() {
        if (cargando) return;
        cargando = true;

        const inicio = paginaActual * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productos = document.querySelectorAll('.product-card');

        for (let i = inicio; i < fin && i < productos.length; i++) {
            productos[i].style.display = 'block';
        }

        paginaActual++;
        cargando = false;

        if (fin >= productos.length) {
            window.removeEventListener('scroll', verificarScroll);
        }
    }

    function verificarScroll() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            cargarMasProductos();
        }
    }

    return {
        iniciar() {
            const productos = document.querySelectorAll('.product-card');
            productos.forEach((producto, index) => {
                if (index >= productosPorPagina) {
                    producto.style.display = 'none';
                }
            });

            window.addEventListener('scroll', verificarScroll);
        }
    };
})();

const moduloComparacionProductos = (function() {
    let productosComparados = [];
    const maxProductosComparados = 3;

    function agregarAComparacion(idProducto) {
        if (productosComparados.length < maxProductosComparados && !productosComparados.includes(idProducto)) {
            productosComparados.push(idProducto);
            actualizarUIComparacion();
        }
    }

    function quitarDeComparacion(idProducto) {
        productosComparados = productosComparados.filter(id => id !== idProducto);
        actualizarUIComparacion();
    }

    function actualizarUIComparacion() {
        const contenedorComparacion = document.getElementById('comparacion-productos');
        contenedorComparacion.innerHTML = '';
        
        productosComparados.forEach(id => {
            const producto = document.querySelector(`.product-card[data-product-id="${id}"]`);
            if (producto) {
                const elementoComparacion = crearElementoComparacion(producto);
                contenedorComparacion.appendChild(elementoComparacion);
            }
        });

        document.getElementById('boton-comparar').style.display = productosComparados.length > 1 ? 'block' : 'none';
    }

    function crearElementoComparacion(producto) {
        const elemento = document.createElement('div');
        elemento.className = 'producto-comparacion';
        elemento.innerHTML = `
            <img src="${producto.querySelector('img').src}" alt="${producto.querySelector('h3').textContent}">
            <h4>${producto.querySelector('h3').textContent}</h4>
            <p>${producto.querySelector('.price').textContent}</p>
            <button class="quitar-comparacion" data-id="${producto.dataset.productId}">Quitar</button>
        `;
        elemento.querySelector('.quitar-comparacion').addEventListener('click', (e) => quitarDeComparacion(e.target.dataset.id));
        return elemento;
    }

    return {
        iniciar() {
            document.querySelectorAll('.product-card').forEach(card => {
                const botonComparar = document.createElement('button');
                botonComparar.textContent = 'Comparar';
                botonComparar.className = 'boton-comparar';
                botonComparar.addEventListener('click', () => agregarAComparacion(card.dataset.productId));
                card.appendChild(botonComparar);
            });

            document.getElementById('boton-comparar').addEventListener('click', () => {
                // Lógica para mostrar la página de comparación detallada
            });
        }
    };
})();

const moduloNotificaciones = (function() {
    let socket;

    function conectarWebSocket() {
        socket = new WebSocket('ws://tu-servidor-websocket.com');
        
        socket.onmessage = function(event) {
            const datos = JSON.parse(event.data);
            mostrarNotificacion(datos);
        };

        socket.onclose = function() {
            setTimeout(conectarWebSocket, 5000);
        };
    }

    function mostrarNotificacion(datos) {
        const contenedorNotificaciones = document.getElementById('notificaciones');
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion';
        notificacion.textContent = datos.mensaje;
        contenedorNotificaciones.appendChild(notificacion);

        setTimeout(() => {
            notificacion.remove();
        }, 5000);
    }

    return {
        iniciar() {
            conectarWebSocket();
        }
    };
})();

const moduloAnalisisComportamiento = (function() {
    let interaccionesUsuario = {};

    function registrarInteraccion(tipoInteraccion, idProducto) {
        if (!interaccionesUsuario[idProducto]) {
            interaccionesUsuario[idProducto] = {};
        }
        interaccionesUsuario[idProducto][tipoInteraccion] = (interaccionesUsuario[idProducto][tipoInteraccion] || 0) + 1;
        
        // Enviar datos al servidor para análisis
        enviarDatosAlServidor(interaccionesUsuario);
    }

    function enviarDatosAlServidor(datos) {
        fetch('/api/analisis-comportamiento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });
    }

    function iniciarSeguimiento() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => registrarInteraccion('click', card.dataset.productId));
            card.addEventListener('mouseover', () => registrarInteraccion('hover', card.dataset.productId));
        });
    }

    return {
        iniciar() {
            iniciarSeguimiento();
        }
    };
})();

const moduloCacheCliente = (function() {
    const cacheProductos = {};

    function guardarEnCache(idProducto, datos) {
        cacheProductos[idProducto] = {
            datos: datos,
            timestamp: Date.now()
        };
        localStorage.setItem('cacheProductos', JSON.stringify(cacheProductos));
    }

    function obtenerDeCache(idProducto) {
        const productoEnCache = cacheProductos[idProducto];
        if (productoEnCache && Date.now() - productoEnCache.timestamp < 3600000) { // 1 hora
            return productoEnCache.datos;
        }
        return null;
    }

    function cargarProducto(idProducto) {
        const datosCache = obtenerDeCache(idProducto);
        if (datosCache) {
            return Promise.resolve(datosCache);
        } else {
            return fetch(`/api/producto/${idProducto}`)
                .then(response => response.json())
                .then(datos => {
                    guardarEnCache(idProducto, datos);
                    return datos;
                });
        }
    }

    return {
        iniciar() {
            const cacheGuardado = localStorage.getItem('cacheProductos');
            if (cacheGuardado) {
                Object.assign(cacheProductos, JSON.parse(cacheGuardado));
            }
        },
        cargarProducto
    };
})();

const moduloGestionEstado = (function() {
    let estado = {
        productos: [],
        carrito: [],
        filtros: {},
        usuario: null
    };

    const observadores = [];

    function actualizarEstado(cambios) {
        estado = { ...estado, ...cambios };
        notificarObservadores();
    }

    function obtenerEstado() {
        return { ...estado };
    }

    function suscribir(observador) {
        observadores.push(observador);
    }

    function notificarObservadores() {
        observadores.forEach(observador => observador(estado));
    }

    return {
        iniciar() {
            // Cargar estado inicial desde el servidor o localStorage
        },
        actualizarEstado,
        obtenerEstado,
        suscribir
    };
})();

const moduloRenderizadoCondicional = (function() {
    let observador;
    const productosVisibles = new Set();

    function iniciarObservador() {
        observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                const idProducto = entrada.target.dataset.productId;
                if (entrada.isIntersecting) {
                    productosVisibles.add(idProducto);
                    renderizarProducto(entrada.target);
                } else {
                    productosVisibles.delete(idProducto);
                    desrenderizarProducto(entrada.target);
                }
            });
        }, { rootMargin: '200px' });

        document.querySelectorAll('.product-card').forEach(card => observador.observe(card));
    }

    function renderizarProducto(elemento) {
        // Cargar detalles completos del producto
        const idProducto = elemento.dataset.productId;
        moduloCacheCliente.cargarProducto(idProducto).then(datos => {
            elemento.innerHTML = `
                <img src="${datos.imagen}" alt="${datos.nombre}">
                <h3>${datos.nombre}</h3>
                <p>${datos.descripcion}</p>
                <span class="price">$${datos.precio}</span>
                <button class="add-to-cart" data-product-id="${datos.id}">Añadir al carrito</button>
            `;
        });
    }

    function desrenderizarProducto(elemento) {
        // Reemplazar con un placeholder ligero
        elemento.innerHTML = '<div class="product-placeholder"></div>';
    }

    return {
        iniciar() {
            iniciarObservador();
        }
    };
})();

const moduloPrecargaInteligente = (function() {
    function precargarSiguientePagina() {
        const siguientePagina = document.querySelector('.pagination .next-page');
        if (siguientePagina) {
            const url = siguientePagina.href;
            fetch(url, { method: 'HEAD' });
        }
    }

    function precargarImagenes() {
        const imagenes = Array.from(document.querySelectorAll('.product-card img[data-src]'))
            .slice(0, 5)
            .map(img => img.dataset.src);

        imagenes.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    function iniciarPrecargaInteligente() {
        if ('IntersectionObserver' in window) {
            const opciones = {
                rootMargin: '200px',
                threshold: 0.1
            };

            const observador = new IntersectionObserver((entradas) => {
                entradas.forEach(entrada => {
                    if (entrada.isIntersecting) {
                        precargarSiguientePagina();
                        precargarImagenes();
                        observador.unobserve(entrada.target);
                    }
                });
            }, opciones);

            const elementoGatillo = document.querySelector('.product-grid');
            if (elementoGatillo) {
                observador.observe(elementoGatillo);
            }
        }
    }

    return {
        iniciar: iniciarPrecargaInteligente
    };
})();

const moduloMetricasRendimiento = (function() {
    let metricas = {
        tiempoCarga: 0,
        interaccionesUsuario: 0,
        erroresJS: 0
    };

    function medirTiempoCarga() {
        metricas.tiempoCarga = performance.now();
    }

    function registrarInteraccion() {
        metricas.interaccionesUsuario++;
    }

    function capturarErrores() {
        window.addEventListener('error', function(event) {
            metricas.erroresJS++;
            enviarMetricas();
        });
    }

    function enviarMetricas() {
        fetch('/api/metricas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metricas)
        });
    }

    return {
        iniciar() {
            medirTiempoCarga();
            document.addEventListener('click', registrarInteraccion);
            capturarErrores();
            setInterval(enviarMetricas, 60000); // Enviar métricas cada minuto
        }
    };
})();

const moduloCargaDinamica = (function() {
    const modulosCargados = new Set();

    function cargarModulo(nombreModulo) {
        if (modulosCargados.has(nombreModulo)) {
            return Promise.resolve();
        }

        return import(`/js/modulos/${nombreModulo}.js`)
            .then(modulo => {
                modulosCargados.add(nombreModulo);
                if (typeof modulo.default.iniciar === 'function') {
                    modulo.default.iniciar();
                }
            })
            .catch(error => console.error(`Error al cargar el módulo ${nombreModulo}:`, error));
    }

    function cargarModulosNecesarios() {
        const modulosNecesarios = document.body.dataset.modulos.split(',');
        return Promise.all(modulosNecesarios.map(cargarModulo));
    }

    return {
        iniciar: cargarModulosNecesarios
    };
})();

const moduloCacheComponentes = (function() {
    const cacheComponentes = new Map();

    function renderizarComponente(tipo, datos) {
        const clave = `${tipo}-${JSON.stringify(datos)}`;
        if (cacheComponentes.has(clave)) {
            return cacheComponentes.get(clave);
        }

        let componente;
        switch (tipo) {
            case 'product-card':
                componente = crearTarjetaProducto(datos);
                break;
            // Añadir más tipos de componentes según sea necesario
        }

        cacheComponentes.set(clave, componente);
        return componente;
    }

    function crearTarjetaProducto(producto) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'product-card';
        tarjeta.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <span class="price">$${producto.precio}</span>
            <button class="add-to-cart" data-product-id="${producto.id}">Añadir al carrito</button>
        `;
        return tarjeta;
    }

    return {
        renderizarComponente
    };
})();

const moduloVirtualizacionListas = (function() {
    let contenedor, items, itemHeight, visibleItems, totalItems;

    function inicializar(config) {
        contenedor = document.querySelector(config.contenedor);
        items = Array.from(contenedor.children);
        itemHeight = items[0].offsetHeight;
        visibleItems = Math.ceil(contenedor.offsetHeight / itemHeight);
        totalItems = items.length;

        contenedor.style.height = `${totalItems * itemHeight}px`;
        contenedor.innerHTML = '';

        window.addEventListener('scroll', actualizarElementosVisibles);
        actualizarElementosVisibles();
    }

    function actualizarElementosVisibles() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleItems + 1, totalItems);

        contenedor.innerHTML = '';
        for (let i = startIndex; i < endIndex; i++) {
            const item = items[i].cloneNode(true);
            item.style.position = 'absolute';
            item.style.top = `${i * itemHeight}px`;
            contenedor.appendChild(item);
        }
    }

    return {
        inicializar
    };
})();

const moduloEventosDelegados = (function() {
    function inicializar(config) {
        const contenedor = document.querySelector(config.contenedor);

        contenedor.addEventListener('click', function(event) {
            if (event.target.matches('.add-to-cart')) {
                const productId = event.target.dataset.productId;
                moduloCarrito.agregarAlCarrito(productId);
            } else if (event.target.matches('.view-quick')) {
                const productId = event.target.dataset.productId;
                moduloVistaRapida.mostrarVistaRapida(productId);
            }
        });

        contenedor.addEventListener('mouseover', function(event) {
            if (event.target.matches('.product-card')) {
                const productId = event.target.dataset.productId;
                moduloAnalisisComportamiento.registrarInteraccion('hover', productId);
            }
        });
    }

    return {
        inicializar
    };
})();

const moduloLazyLoading = (function() {
    function inicializar() {
        const imagenes = document.querySelectorAll('img[data-src]');
        const opciones = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observador = new IntersectionObserver((entradas, observador) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    const imagen = entrada.target;
                    imagen.src = imagen.dataset.src;
                    imagen.removeAttribute('data-src');
                    observador.unobserve(imagen);
                }
            });
        }, opciones);

        imagenes.forEach(imagen => observador.observe(imagen));
    }

    return {
        inicializar
    };
})();

const moduloPrefetchingInteligente = (function() {
    function inicializar() {
        document.querySelectorAll('a').forEach(enlace => {
            enlace.addEventListener('mouseover', () => {
                const url = enlace.href;
                if (!url.startsWith(window.location.origin)) return;
                
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = url;
                document.head.appendChild(link);
            });
        });
    }

    function prefetchProximaPagina() {
        const paginacionSiguiente = document.querySelector('.pagination .next');
        if (paginacionSiguiente) {
            const url = paginacionSiguiente.href;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        }
    }

    return {
        inicializar,
        prefetchProximaPagina
    };
})();

const moduloGestionEstadoGlobal = (function() {
    let estado = {
        productos: [],
        carrito: [],
        usuario: null,
        filtros: {}
    };

    const observadores = [];

    function actualizarEstado(cambios) {
        estado = { ...estado, ...cambios };
        notificarObservadores();
    }

    function obtenerEstado() {
        return { ...estado };
    }

    function suscribir(observador) {
        observadores.push(observador);
    }

    function notificarObservadores() {
        observadores.forEach(observador => observador(estado));
    }

    return {
        actualizarEstado,
        obtenerEstado,
        suscribir
    };
})();

const moduloErroresYLogging = (function() {
    function inicializar() {
        window.onerror = function(mensaje, fuente, linea, columna, error) {
            registrarError({
                tipo: 'error_js',
                mensaje,
                fuente,
                linea,
                columna,
                stack: error && error.stack
            });
        };

        window.addEventListener('unhandledrejection', function(event) {
            registrarError({
                tipo: 'promesa_no_manejada',
                mensaje: event.reason
            });
        });
    }

    function registrarError(error) {
        console.error('Error capturado:', error);
        // Aquí puedes enviar el error a un servicio de logging
        fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(error)
        });
    }

    return {
        inicializar,
        registrarError
    };
})();

const moduloCacheConsultas = (function() {
    const cache = new Map();
    const TTL = 5 * 60 * 1000; // 5 minutos

    function obtenerResultados(consulta) {
        const cacheKey = JSON.stringify(consulta);
        const cachedResult = cache.get(cacheKey);

        if (cachedResult && Date.now() - cachedResult.timestamp < TTL) {
            return Promise.resolve(cachedResult.data);
        }

        return fetch('/api/productos/buscar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consulta)
        })
        .then(response => response.json())
        .then(data => {
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        });
    }

    function limpiarCache() {
        const ahora = Date.now();
        for (let [key, value] of cache) {
            if (ahora - value.timestamp > TTL) {
                cache.delete(key);
            }
        }
    }

    setInterval(limpiarCache, TTL);

    return {
        obtenerResultados
    };
})();

const moduloOptimizacionImagenes = (function() {
    function inicializar() {
        if ('connection' in navigator) {
            ajustarCalidadImagenes();
            navigator.connection.addEventListener('change', ajustarCalidadImagenes);
        }
    }

    function ajustarCalidadImagenes() {
        const calidad = obtenerCalidadOptima();
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = new URL(img.dataset.src);
            src.searchParams.set('q', calidad);
            img.src = src.toString();
        });
    }

    function obtenerCalidadOptima() {
        const connection = navigator.connection;
        if (connection.saveData) return 60;
        if (connection.effectiveType === '4g') return 90;
        if (connection.effectiveType === '3g') return 70;
        return 80;
    }

    return {
        inicializar
    };
})();

const moduloAnimacionesOptimizadas = (function() {
    function animar(elemento, keyframes, opciones) {
        return new Promise(resolve => {
            const animacion = elemento.animate(keyframes, opciones);
            animacion.onfinish = () => resolve(animacion);
        });
    }

    function animarEntradaProducto(elemento) {
        return animar(elemento, [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], {
            duration: 300,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }

    function animarSalidaProducto(elemento) {
        return animar(elemento, [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' }
        ], {
            duration: 250,
            easing: 'ease-in',
            fill: 'forwards'
        });
    }

    return {
        animarEntradaProducto,
        animarSalidaProducto
    };
})();

const moduloGestionRecursosCriticos = (function() {
    function inicializar() {
        aplicarResourceHints();
        aplicarPriorityHints();
    }

    function aplicarResourceHints() {
        const recursosImportantes = [
            { url: '/css/critical.css', as: 'style' },
            { url: '/js/core.js', as: 'script' },
            { url: '/api/datos-iniciales', as: 'fetch' }
        ];

        recursosImportantes.forEach(recurso => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = recurso.url;
            link.as = recurso.as;
            document.head.appendChild(link);
        });
    }

    function aplicarPriorityHints() {
        const elementosCriticos = document.querySelectorAll('.critical-element');
        elementosCriticos.forEach(elemento => {
            elemento.setAttribute('importance', 'high');
        });
    }

    return {
        inicializar
    };
})();

const moduloDeteccionCapacidades = (function() {
    const capacidades = {
        webp: false,
        webgl: false,
        touchEvents: false,
        serviceWorker: false
    };

    function detectarCapacidades() {
        // Detección de soporte WebP
        const webpTest = new Image();
        webpTest.onload = function() {
            capacidades.webp = (webpTest.width > 0) && (webpTest.height > 0);
        };
        webpTest.onerror = function() {
            capacidades.webp = false;
        };
        webpTest.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

        // Detección de WebGL
        try {
            const canvas = document.createElement('canvas');
            capacidades.webgl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch(e) {
            capacidades.webgl = false;
        }

        // Detección de eventos táctiles
        capacidades.touchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Detección de Service Worker
        capacidades.serviceWorker = 'serviceWorker' in navigator;

        aplicarAdaptaciones();
    }

    function aplicarAdaptaciones() {
        if (capacidades.webp) {
            document.body.classList.add('webp');
        }
        if (!capacidades.webgl) {
            document.body.classList.add('no-webgl');
        }
        if (capacidades.touchEvents) {
            document.body.classList.add('touch-device');
        }
        if (capacidades.serviceWorker) {
            registrarServiceWorker();
        }
    }

    function registrarServiceWorker() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('Service Worker registrado'))
            .catch(error => console.error('Error al registrar Service Worker:', error));
    }

    return {
        inicializar: detectarCapacidades,
        obtenerCapacidades: () => ({ ...capacidades })
    };
})();

const moduloGestionMemoria = (function() {
    const intervalosLimpieza = new Set();
    const timeoutsLimpieza = new Set();

    function inicializar() {
        window.addEventListener('beforeunload', limpiarTodo);
    }

    function programarLimpieza(funcion, intervalo) {
        const id = setInterval(funcion, intervalo);
        intervalosLimpieza.add(id);
        return id;
    }

    function programarLimpiezaUnica(funcion, retraso) {
        const id = setTimeout(() => {
            funcion();
            timeoutsLimpieza.delete(id);
        }, retraso);
        timeoutsLimpieza.add(id);
        return id;
    }

    function cancelarLimpieza(id) {
        clearInterval(id);
        clearTimeout(id);
        intervalosLimpieza.delete(id);
        timeoutsLimpieza.delete(id);
    }

    function limpiarTodo() {
        intervalosLimpieza.forEach(clearInterval);
        timeoutsLimpieza.forEach(clearTimeout);
        intervalosLimpieza.clear();
        timeoutsLimpieza.clear();
    }

    return {
        inicializar,
        programarLimpieza,
        programarLimpiezaUnica,
        cancelarLimpieza
    };
})();

const moduloMonitoreoRendimiento = (function() {
    const metricas = {
        tiempoCarga: 0,
        fpsPromedio: 0,
        tiempoRespuestaAPI: {},
        errores: []
    };

    let contadorFrames = 0;
    let ultimoTiempo = performance.now();

    function inicializar() {
        window.addEventListener('load', registrarTiempoCarga);
        requestAnimationFrame(medirFPS);
        window.addEventListener('error', registrarError);
        interceptarLlamadasAPI();
    }

    function registrarTiempoCarga() {
        metricas.tiempoCarga = performance.now();
    }

    function medirFPS(tiempoActual) {
        contadorFrames++;
        if (tiempoActual - ultimoTiempo > 1000) {
            metricas.fpsPromedio = contadorFrames;
            contadorFrames = 0;
            ultimoTiempo = tiempoActual;
            enviarMetricas();
        }
        requestAnimationFrame(medirFPS);
    }

    function registrarError(evento) {
        metricas.errores.push({
            mensaje: evento.message,
            origen: evento.filename,
            linea: evento.lineno,
            columna: evento.colno,
            timestamp: Date.now()
        });
    }

    function interceptarLlamadasAPI() {
        const fetchOriginal = window.fetch;
        window.fetch = function(...args) {
            const inicio = performance.now();
            return fetchOriginal.apply(this, args).then(response => {
                const fin = performance.now();
                const url = args[0];
                metricas.tiempoRespuestaAPI[url] = fin - inicio;
                return response;
            });
        };
    }

    function enviarMetricas() {
        fetch('/api/metricas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metricas)
        });
    }

    return {
        inicializar
    };
})();

const moduloGestionCacheAvanzado = (function() {
    const CACHE_NAME = 'matiz-vision-cache-v1';
    const URLS_TO_CACHE = [
        '/',
        '/css/styles.css',
        '/js/main.js',
        '/images/logo.png'
    ];

    function inicializar() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registrado con éxito:', registration.scope);
                    })
                    .catch(error => {
                        console.error('Error al registrar el Service Worker:', error);
                    });
            });
        }
    }

    function precachearRecursos() {
        return caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(URLS_TO_CACHE);
            });
    }

    function actualizarCache(request, response) {
        return caches.open(CACHE_NAME)
            .then(cache => {
                cache.put(request, response.clone());
                return response;
            });
    }

    function buscarEnCache(request) {
        return caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(request).then(response => {
                    return actualizarCache(request, response);
                });
            });
    }

    return {
        inicializar,
        precachearRecursos,
        buscarEnCache
    };
})();

const moduloInternacionalizacion = (function() {
    let idiomaActual = 'es';
    const traducciones = {
        es: {},
        en: {},
        // Añadir más idiomas según sea necesario
    };

    function cargarTraducciones(idioma) {
        return fetch(`/api/traducciones/${idioma}`)
            .then(response => response.json())
            .then(data => {
                traducciones[idioma] = data;
            });
    }

    function cambiarIdioma(nuevoIdioma) {
        if (traducciones[nuevoIdioma]) {
            idiomaActual = nuevoIdioma;
            actualizarInterfaz();
        } else {
            cargarTraducciones(nuevoIdioma)
                .then(() => {
                    idiomaActual = nuevoIdioma;
                    actualizarInterfaz();
                });
        }
    }

    function actualizarInterfaz() {
        document.querySelectorAll('[data-i18n]').forEach(elemento => {
            const clave = elemento.getAttribute('data-i18n');
            elemento.textContent = traducciones[idiomaActual][clave] || clave;
        });
    }

    function formatearFecha(fecha) {
        return new Intl.DateTimeFormat(idiomaActual).format(fecha);
    }

    function formatearMoneda(cantidad) {
        return new Intl.NumberFormat(idiomaActual, { style: 'currency', currency: 'USD' }).format(cantidad);
    }

    return {
        inicializar(idiomaInicial = 'es') {
            cargarTraducciones(idiomaInicial)
                .then(() => {
                    idiomaActual = idiomaInicial;
                    actualizarInterfaz();
                });
        },
        cambiarIdioma,
        formatearFecha,
        formatearMoneda
    };
})();

const moduloOptimizacionConsultas = (function() {
    const cache = new Map();

    function obtenerProductosConCategoria() {
        return fetch('/api/productos-con-categoria')
            .then(response => response.json());
    }

    function obtenerProductosPopulares() {
        const key = 'productos_populares';
        if (cache.has(key)) {
            return Promise.resolve(cache.get(key));
        }
        return fetch('/api/productos-populares')
            .then(response => response.json())
            .then(data => {
                cache.set(key, data);
                setTimeout(() => cache.delete(key), 3600000); // Caché por 1 hora
                return data;
            });
    }

    function buscarProductos(query) {
        return fetch(`/api/buscar-productos?q=${encodeURIComponent(query)}`)
            .then(response => response.json());
    }

    function obtenerPedidosUsuario(usuarioId) {
        return fetch(`/api/pedidos-usuario/${usuarioId}`)
            .then(response => response.json());
    }

    function obtenerEstadisticasVentas() {
        const key = 'estadisticas_ventas';
        if (cache.has(key)) {
            return Promise.resolve(cache.get(key));
        }
        return fetch('/api/estadisticas-ventas')
            .then(response => response.json())
            .then(data => {
                cache.set(key, data);
                setTimeout(() => cache.delete(key), 86400000); // Caché por 24 horas
                return data;
            });
    }

    return {
        obtenerProductosConCategoria,
        obtenerProductosPopulares,
        buscarProductos,
        obtenerPedidosUsuario,
        obtenerEstadisticasVentas
    };
})();

const moduloCargaDiferida = (function() {
    function cargarComponente(nombre) {
        return import(`/js/componentes/${nombre}.js`)
            .then(modulo => {
                modulo.default.inicializar();
                return modulo.default;
            });
    }

    function observarElementos() {
        const observador = new IntersectionObserver((entradas, observador) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    const elemento = entrada.target;
                    const componente = elemento.dataset.componente;
                    cargarComponente(componente).then(modulo => {
                        modulo.renderizar(elemento);
                    });
                    observador.unobserve(elemento);
                }
            });
        }, { rootMargin: '100px' });

        document.querySelectorAll('[data-componente]').forEach(elemento => {
            observador.observe(elemento);
        });
    }

    return {
        inicializar: observarElementos
    };
})();

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

    return {
        iniciar() {
            console.log('DOM completamente cargado');
            inicializarModulos();
            console.log('Todos los módulos han sido inicializados');
        }
    };
})();

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', App.iniciar);