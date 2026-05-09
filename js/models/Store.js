class Store {
    static renderCatalog() {
        const productContainer = document.getElementById('product-container');
        if (!productContainer) return;

        const products = Storage.getProducts();
        productContainer.innerHTML = '';

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
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" style="width: 60px; padding: 0.5rem; text-align: center; border: 1px solid #ccc;">
                    <button class="btn btn--primary" style="flex-grow: 1;" onclick="addToCart(${product.id})">
                        Agregar
                    </button>
                </div>
            `;

            productContainer.appendChild(productCard);
        });
    }
}