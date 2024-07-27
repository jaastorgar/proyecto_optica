const moduloHome = (function() {
    function inicializarCarrusel() {
        const carrusel = document.querySelector('.carousel-inner');
        const items = carrusel.querySelectorAll('.carousel-item');
        const botonAnterior = document.querySelector('.prev');
        const botonSiguiente = document.querySelector('.next');
        let indiceActual = 0;

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

        botonAnterior.addEventListener('click', diapositivaAnterior);
        botonSiguiente.addEventListener('click', siguienteDiapositiva);

        setInterval(siguienteDiapositiva, 5000);
    }

    function inicializarTestimonios() {
        const testimonios = document.querySelector('.testimonios');
        const itemsTestimonio = document.querySelectorAll('.testimonio');
        itemsTestimonio.forEach(item => {
            const clon = item.cloneNode(true);
            testimonios.appendChild(clon);
        });
    }

    return {
        iniciar: function() {
            inicializarCarrusel();
            inicializarTestimonios();
        }
    };
})();

document.addEventListener('DOMContentLoaded', moduloHome.iniciar);