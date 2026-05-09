class Cart {
    constructor() {
        // Inicializamos el carrito buscando en localStorage, si no hay nada, usamos un array vacío
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
    }

    // Cumple con: agregarProducto(producto, cantidad)
    addProduct(product, quantity = 1) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            // Si el producto ya está en el carrito, solo sumamos la cantidad
            existingItem.quantity += quantity;
        } else {
            // Si es nuevo, lo pusheamos al array
            this.items.push({ product, quantity });
        }
        
        this.saveCart();
        this.render();
    }

    // Cumple con: eliminarProducto(id)
    removeProduct(id) {
        this.items = this.items.filter(item => item.product.id !== id);
        this.saveCart();
        this.render();
    }

    // Cumple con: calcularTotal()
    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    // Cumple con: vaciarCarrito()
    emptyCart() {
        this.items = [];
        this.saveCart();
        this.render();
    }

    // Método auxiliar para persistir el carrito en localStorage (KISS)
    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    // Cumple con: renderizar() (muestra los productos del carrito en el DOM)
    render() {
        // Selección del DOM requerida
        const cartContainer = document.getElementById('cart-container');
        const totalContainer = document.getElementById('cart-total');
        
        // Evitamos errores si el DOM aún no ha cargado completamente
        if (!cartContainer || !totalContainer) return; 

        // Limpiamos el contenedor antes de renderizar para evitar duplicados
        cartContainer.innerHTML = ''; 

        // Creación de elementos dinámicos
        this.items.forEach(item => {
            const cartElement = document.createElement('div');
            cartElement.className = 'cart__item'; // Clase preparada para CSS BEM
            
            cartElement.innerHTML = `
                <div class="cart__item-details">
                    <span class="cart__item-icon">${item.product.image}</span>
                    <span class="cart__item-name">${item.product.name}</span>
                    <span class="cart__item-price">$${item.product.price.toLocaleString()}</span>
                </div>
                <div class="cart__item-actions">
                    <span class="cart__item-quantity">Cant: ${item.quantity}</span>
                    <button class="cart__btn-remove" onclick="cart.removeProduct(${item.product.id})">❌ Eliminar</button>
                </div>
            `;
            
            cartContainer.appendChild(cartElement);
        });

        // Actualizamos el total en el DOM
        totalContainer.textContent = `$${this.calculateTotal().toLocaleString()}`;
    }
}

// Instanciamos el carrito para que esté disponible globalmente
const cart = new Cart();