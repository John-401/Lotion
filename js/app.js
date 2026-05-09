// --- CONTROLADOR PRINCIPAL DE LA APLICACIÓN (SPA) ---
const app = {
    // Función para cambiar entre vistas (Inicio, Catálogo, Nosotros)
    showView: function(viewId) {
        const sections = document.querySelectorAll('.view-section');
        
        sections.forEach(section => {
            section.classList.add('hidden');
        });

        const targetSection = document.getElementById(`view-${viewId}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    },

    // Función que arranca toda la lógica al cargar la página
    init: function() {
        Store.renderCatalog();
        checkAuthState();
        setupModalEvents();

        // Validar que el carrito exista antes de renderizar
        if (typeof cart !== 'undefined') {
            cart.render();
        } else {
            console.warn("Advertencia: El objeto 'cart' no está definido globalmente.");
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


// --- FUNCIÓN ACTUALIZADA Y SEGURA PARA AGREGAR AL CARRITO ---
window.addToCart = function(productId) {
    // 1. Validar Sesión
    if (!User.getCurrentUser()) {
        alert('Por favor, inicia sesión para agregar productos al carrito.');
        const btnLogin = document.getElementById('btn-show-login');
        if (btnLogin) btnLogin.click(); 
        return;
    }

    // 2. Obtener el producto de la base de datos simulada
    const product = Storage.getProductById(productId);
    if (!product) return;

    // 3. Captura SEGURA del input de cantidad
    const quantityInput = document.getElementById(`qty-${productId}`);
    let quantity = 1; // Cantidad por defecto
    
    // Si el input existe en el DOM, tomamos su valor
    if (quantityInput) {
        quantity = parseInt(quantityInput.value) || 1;
    }

    // 4. Validaciones de inventario
    if (quantity <= 0) {
        alert('Debes seleccionar al menos 1 unidad para agregar.');
        return;
    }
    
    if (quantity > product.stock) {
        alert(`Solo tenemos ${product.stock} unidades en stock de ${product.name}.`);
        return;
    }
    
    // 5. Agregar al carrito y resetear el input
    if (typeof cart !== 'undefined') {
        cart.addProduct(product, quantity);
        if (quantityInput) {
            quantityInput.value = 1; // Regresar el input a 1
        }
    }
};

// --- FUNCIÓN SEGURA PARA ELIMINAR CANTIDADES DEL CARRITO ---
window.removeFromCart = function(productId) {
    // Captura SEGURA del input de eliminar
    const removeInput = document.getElementById(`remove-qty-${productId}`);
    let qtyToRemove = 1;
    
    if (removeInput) {
        qtyToRemove = parseInt(removeInput.value) || 1;
    }
    
    if (qtyToRemove <= 0) {
        alert('Ingresa una cantidad válida para eliminar.');
        return;
    }
    
    if (typeof cart !== 'undefined') {
        cart.removeQuantity(productId, qtyToRemove);
    }
};

// --- FUNCIÓN PARA VERIFICAR ESTADO DE SESIÓN ---
function checkAuthState() {
    const currentUser = User.getCurrentUser();
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnLogout = document.getElementById('btn-logout');
    const userGreeting = document.getElementById('user-greeting');

    if (currentUser) {
        if(btnShowLogin) btnShowLogin.classList.add('hidden');
        if(btnLogout) btnLogout.classList.remove('hidden');
        if(userGreeting) userGreeting.textContent = `Hola, ${currentUser.name}`;
    } else {
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

    let isLoginMode = true; 

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
                if(User.login(email, password)) {
                    modal.classList.add('hidden');
                    checkAuthState();
                    authForm.reset();
                }
            } else {
                const name = document.getElementById('auth-name').value;
                if(User.register(name, email, password)) {
                    btnSwitchAuth.click(); 
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
            if (typeof cart !== 'undefined') cart.emptyCart(); 
            app.showView('home'); 
        });
    }
}