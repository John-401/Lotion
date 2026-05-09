class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Aseguramos que sume la cantidad correcta
    addProduct(product, quantity = 1) {
        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ product, quantity });
        }
        
        this.save();
        this.render();
    }

    // NUEVO: Método con la validación exigida
    removeQuantity(productId, quantityToRemove) {
        const item = this.items.find(i => i.product.id === productId);
        if (!item) return;

        // Validación: No puede eliminar más de lo que tiene
        if (quantityToRemove > item.quantity) {
            alert(`¡Cuidado! Estás intentando eliminar ${quantityToRemove} unidades, pero solo tienes ${item.quantity} en tu carrito.`);
            return;
        }

        if (quantityToRemove === item.quantity) {
            // Si elimina todo, filtramos el producto fuera del arreglo
            this.items = this.items.filter(i => i.product.id !== productId);
        } else {
            // Si elimina una parte, solo restamos
            item.quantity -= quantityToRemove;
        }

        this.save();
        this.render();
    }

    emptyCart() { 
        this.items = []; 
        this.save(); 
        this.render(); 
    }
    
    save() { 
        localStorage.setItem('cart', JSON.stringify(this.items)); 
    }

    render() {
        const container = document.getElementById('cart-container');
        if (!container) return;

        container.innerHTML = this.items.map(item => `
            <div class="cart-item" style="display: flex; flex-direction: column; padding-bottom: 1rem; border-bottom: 1px solid #eee; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>${item.product.name}</strong>
                    <span>$${(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.85rem; color: #666;">Cant actual: ${item.quantity}</span>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="number" id="remove-qty-${item.product.id}" value="1" min="1" max="${item.quantity}" style="width: 50px; padding: 0.2rem; text-align: center;">
                        <button onclick="removeFromCart(${item.product.id})" style="color: #d9534f; cursor: pointer; border: none; background: transparent; font-size: 0.85rem; font-weight: bold;">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');

        const total = this.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.innerText = `$${total.toLocaleString()}`;
        }
    }
}

// Instanciamos el carrito para que sea global
const cart = new Cart();
