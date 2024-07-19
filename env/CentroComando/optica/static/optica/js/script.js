document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;
    let interval;

    function showSlide(index) {
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(currentIndex);
    }

    function startAutoSlide() {
        interval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        clearInterval(interval);
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    });

    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);

    startAutoSlide();
});

// Testimonios
const testimonios = document.querySelector('.testimonios');
const testimonioItems = document.querySelectorAll('.testimonio');

testimonioItems.forEach(item => {
    const clone = item.cloneNode(true);
    testimonios.appendChild(clone);
});

// Agregar productos al carrito
document.addEventListener('DOMContentLoaded', function() {
    const addToCartUrl = document.getElementById('add-to-cart-url').value;

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id');
            fetch(addToCartUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({ product_id: productId })
            }).then(response => {
                if (response.ok) {
                    alert('Producto añadido al carrito');
                } else {
                    alert('Error al añadir el producto al carrito');
                }
            });
        });
    });
});

// Para productos.html
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            fetch("/add_to_cart/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ product_id: productId })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            });
        });
    });
});

function getCookie(name) {
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