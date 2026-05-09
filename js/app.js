// --- CONTROLADOR PRINCIPAL DE LA APLICACIÓN (SPA) ---
const app = {
    // Función para cambiar entre vistas (Inicio, Catálogo, Nosotros)
    showView: function(viewId) {
        // Seleccionamos todas las secciones principales
        const sections = document.querySelectorAll('.view-section');
        
        // Ocultamos todas añadiendo la clase 'hidden'
        sections.forEach(section => {
            section.classList.add('hidden');
        });

        // Mostramos únicamente la sección solicitada
        const targetSection = document.getElementById(`view-${viewId}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    },

    // Función que arranca toda la lógica al cargar la página
    init: function() {
        renderCatalog();
        checkAuthState();
        setupModalEvents();

        // Validar que el carrito exista antes de renderizar
        if (typeof cart !== 'undefined') {
            cart.render();
        }

        // Evento para el botón de vaciar carrito
        const btnEmptyCart = document.getElementById('btn-empty-cart');
        if (btnEmptyCart) {
            btnEmptyCart.addEventListener('click', () => {
                if (typeof cart !== 'undefined') {
                    cart.emptyCart();
                }
            });
        }
    }
};

// --- INICIALIZADOR DE EVENTOS GLOBALES ---
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// --- FUNCIÓN PARA RENDERIZAR EL CATÁLOGO (DOM Dinámico) ---
function renderCatalog() {
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return; // Salir si no estamos en la vista que tiene el contenedor

    // Traemos los productos usando la clase estática (POO)
    const products = Storage.getProducts();

    // Limpiamos el contenedor antes de inyectar
    productContainer.innerHTML = '';

    // Inyectamos el HTML de cada tarjeta
    products.forEach(product => {
        const productCard = document.createElement('article');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <div class="product-card__image">${product.image}</div>
            <div class="product-card__info">
                <h3 class="product-card__name">${product.name}</h3>
                <p class="product-card__category">${product.category}</p>
                <p class="product-card__price">$${product.price.toLocaleString()}</p>
                <p class="product-card__stock">Stock: ${product.stock}</p>
            </div>
            <button class="btn btn--primary" onclick="addToCart(${product.id})">
                Agregar al carrito
            </button>
        `;

        productContainer.appendChild(productCard);
    });
}

// --- FUNCIÓN PARA AGREGAR AL CARRITO ---
// Se asigna al objeto global 'window' para que el HTML pueda ejecutarla en el onclick
window.addToCart = function(productId) {
    if (!User.getCurrentUser()) {
        alert('Por favor, inicia sesión para agregar productos al carrito.');
        document.getElementById('btn-show-login').click(); // Abrir modal automáticamente
        return;
    }

    const product = Storage.getProductById(productId);
    if (product && product.stock > 0) {
        cart.addProduct(product, 1);
    } else {
        alert('Lo sentimos, este producto está agotado.');
    }
};

// --- FUNCIÓN PARA VERIFICAR ESTADO DE SESIÓN ---
function checkAuthState() {
    const currentUser = User.getCurrentUser();
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnLogout = document.getElementById('btn-logout');
    const userGreeting = document.getElementById('user-greeting');

    if (currentUser) {
        // Usuario logueado: Ocultar botón "Iniciar Sesión", mostrar "Salir" y saludo
        if(btnShowLogin) btnShowLogin.classList.add('hidden');
        if(btnLogout) btnLogout.classList.remove('hidden');
        if(userGreeting) userGreeting.textContent = `Hola, ${currentUser.name}`;
    } else {
        // Sin sesión activa
        if(btnShowLogin) btnShowLogin.classList.remove('hidden');
        if(btnLogout) btnLogout.classList.add('hidden');
        if(userGreeting) userGreeting.textContent = '';
    }
}

// --- CONFIGURACIÓN DE EVENTOS DEL MODAL DE AUTENTICACIÓN ---
function setupModalEvents() {
    const modal = document.getElementById('auth-modal');
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnSwitchAuth = document.getElementById('btn-switch-auth');
    const authForm = document.getElementById('auth-form');
    const btnLogout = document.getElementById('btn-logout');

    let isLoginMode = true; // Controla si estamos en modo Login o Registro

    // Abrir/Cerrar Modal
    if(btnShowLogin) btnShowLogin.addEventListener('click', () => modal.classList.remove('hidden'));
    if(btnCloseModal) btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));

    // Cambiar entre Login y Registro dentro del Modal
    if(btnSwitchAuth) {
        btnSwitchAuth.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            document.getElementById('modal-title').textContent = isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta';
            document.getElementById('group-name').classList.toggle('hidden', isLoginMode);
            btnSwitchAuth.textContent = isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión';
        });
    }

    // Procesar envío del formulario (Submit)
    if(authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;

            if (isLoginMode) {
                // Flujo de Login
                if(User.login(email, password)) {
                    modal.classList.add('hidden');
                    checkAuthState();
                    authForm.reset();
                }
            } else {
                // Flujo de Registro
                const name = document.getElementById('auth-name').value;
                if(User.register(name, email, password)) {
                    btnSwitchAuth.click(); // Cambia a la vista de login automáticamente
                    authForm.reset();
                }
            }
        });
    }

    // Acción de Cerrar sesión
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            User.logout();
            checkAuthState();
            if (typeof cart !== 'undefined') cart.emptyCart(); // Vaciar carrito por seguridad
            app.showView('home'); // Redirigir a inicio
        });
    }
}