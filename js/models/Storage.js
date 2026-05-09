class Storage {
    
    static getProducts() {
        let products = JSON.parse(localStorage.getItem('lotions'));
        
        if (!products) {
            products = initialLotions;
            localStorage.setItem('lotions', JSON.stringify(products));
        }
        
        return products;
    }

    static getProductById(id) {
        const products = this.getProducts();
        return products.find(product => product.id === id);
    }

    static updateStock(productId, quantityPurchased) {
        const products = this.getProducts();
        
        const updatedProducts = products.map(product => {
            if (product.id === productId) {
                product.stock -= quantityPurchased;
            }
            return product;
        });
        
        localStorage.setItem('lotions', JSON.stringify(updatedProducts));
    }
}