// Módulo de gestión del carrito
const cartStateModule = (function() {
    let cartItems = {};

    function addItem(productId, quantity = 1) {
        if (cartItems[productId]) {
            cartItems[productId] += quantity;
        } else {
            cartItems[productId] = quantity;
        }
        updateCartUI();
    }

    function removeItem(productId) {
        if (cartItems[productId]) {
            delete cartItems[productId];
            updateCartUI();
        }
    }

    function updateQuantity(productId, quantity) {
        if (quantity > 0) {
            cartItems[productId] = quantity;
        } else {
            removeItem(productId);
        }
        updateCartUI();
    }

    function getCartItems() {
        return {...cartItems};
    }

    function getCartCount() {
        return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
    }

    function updateCartUI() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = getCartCount();
            cartCountElement.classList.add('fade-in');
            setTimeout(() => {
                cartCountElement.classList.remove('fade-in');
            }, 300);
        }
    }

    return {
        addItem,
        removeItem,
        updateQuantity,
        getCartItems,
        getCartCount
    };
})();


// Módulo del carrusel
const carouselModule = (function() {
    let carousel, items, prevBtn, nextBtn, currentIndex, interval;

    function init() {
        carousel = document.querySelector('.carousel-inner');
        items = carousel.querySelectorAll('.carousel-item');
        prevBtn = document.querySelector('.prev');
        nextBtn = document.querySelector('.next');
        currentIndex = 0;

        setupEventListeners();
        startAutoSlide();
    }

    function setupEventListeners() {
        prevBtn.addEventListener('click', handlePrevClick);
        nextBtn.addEventListener('click', handleNextClick);
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }

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

    function handlePrevClick() {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    }

    function handleNextClick() {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    }

    return {
        init: init
    };
})();

// Módulo de testimonios
const testimoniosModule = (function() {
    function init() {
        const testimonios = document.querySelector('.testimonios');
        const testimonioItems = document.querySelectorAll('.testimonio');

        testimonioItems.forEach(item => {
            const clone = item.cloneNode(true);
            testimonios.appendChild(clone);
        });
    }

    return {
        init: init
    };
})();

// Módulo del carrito de compras
const cartModule = (function() {
    function init() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                const addToCartUrl = document.getElementById('add-to-cart-url').value;
                addToCart(this, addToCartUrl);
            });
        });
    }

    function addToCart(button, url) {
        const productId = button.getAttribute('data-product-id');
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ product_id: productId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cartStateModule.addItem(productId);
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

    return {
        init: init
    };
})();

// Módulo de filtrado y ordenamiento de productos
const productFilterModule = (function() {
    let filterForm, productsList, sortSelect;

    function init() {
        filterForm = document.getElementById('filter-form');
        productsList = document.getElementById('products-list');
        sortSelect = document.getElementById('sort-select');

        if (filterForm) {
            filterForm.addEventListener('submit', handleFilterSubmit);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', sortProducts);
        }
    }

    function handleFilterSubmit(e) {
        e.preventDefault();
        applyFilters();
    }

    function applyFilters() {
        const categoria = document.getElementById('categoria').value;
        const marca = document.getElementById('marca').value;
        const precioMin = document.getElementById('precio_min').value;
        const precioMax = document.getElementById('precio_max').value;
        const genero = document.getElementById('genero').value;

        const products = document.querySelectorAll('.product-card');

        products.forEach(product => {
            let show = true;

            if (categoria && product.dataset.category !== categoria) show = false;
            if (marca && product.dataset.brand !== marca) show = false;
            if (precioMin && parseFloat(product.dataset.price) < parseFloat(precioMin)) show = false;
            if (precioMax && parseFloat(product.dataset.price) > parseFloat(precioMax)) show = false;
            if (genero && product.dataset.gender !== genero) show = false;

            product.style.display = show ? 'block' : 'none';
        });

        sortProducts();
    }

    function sortProducts() {
        const sortBy = sortSelect.value;
        const products = Array.from(productsList.children);

        products.sort((a, b) => {
            if (sortBy === 'price-asc') {
                return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            } else if (sortBy === 'price-desc') {
                return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            } else if (sortBy === 'name-asc') {
                return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
            } else if (sortBy === 'name-desc') {
                return b.querySelector('h3').textContent.localeCompare(a.querySelector('h3').textContent);
            }
        });

        products.forEach(product => productsList.appendChild(product));
    }

    return {
        init: init
    };
})();

// Módulo de vista rápida de productos
const quickViewModule = (function() {
    let modal, modalContent, closeModal;

    function init() {
        modal = document.getElementById('quick-view-modal');
        modalContent = document.getElementById('quick-view-content');
        closeModal = document.getElementsByClassName('close')[0];

        setupEventListeners();
    }

    function setupEventListeners() {
        document.querySelectorAll('.view-quick').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                openQuickView(productId);
            });
        });

        closeModal.onclick = closeQuickView;
        window.onclick = handleWindowClick;
    }

    function handleQuickViewClick() {
        const productId = this.getAttribute('data-product-id');
        openQuickView(productId);
    }

    function openQuickView(productId) {
        fetch(`/api/product/${productId}/`)
            .then(response => response.json())
            .then(product => {
                modalContent.innerHTML = `
                    <h2>${product.armazon}</h2>
                    <img src="${product.imagen}" alt="${product.armazon}">
                    <p>${product.caracteristica}</p>
                    <p>Precio: $${product.precio}</p>
                    <button class="btn add-to-cart" data-product-id="${product.codigo}">Añadir al carrito</button>
                `;
                modal.style.display = "block";
            })
            .catch(error => {
                console.error('Error:', error);
                modalContent.innerHTML = '<p>Error al cargar los detalles del producto.</p>';
                modal.style.display = "block";
            });
    }    

    function closeQuickView() {
        modal.style.display = "none";
    }

    function handleWindowClick(event) {
        if (event.target == modal) {
            closeQuickView();
        }
    }

    return {
        init: init
    };
})();

// Módulo de productos
const productModule = (function() {
    function init() {
        animateProducts();
    }

    function animateProducts() {
        const products = document.querySelectorAll('.product-card');
        products.forEach((product, index) => {
            product.classList.add('slide-up');
            setTimeout(() => {
                product.classList.add('show');
            }, index * 100);
        });
    }

    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazy-load');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    observer.unobserve(img);
                }
            });
        }, options);

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    return {
        init: init
    };
})();

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    carouselModule.init();
    testimoniosModule.init();
    cartModule.init();
    productFilterModule.init();
    quickViewModule.init();
    productModule.init();
});