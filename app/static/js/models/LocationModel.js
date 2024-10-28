// static/js/models/LocationModel.js
class LocationModel {
    constructor(data) {
        this.name = data.name;
        this.lat = data.lat;
        this.lng = data.lng;
        this.city = data.city;
        this.description = data.description;
        this.products = data.products;
        this.contact = data.contact;
    }

    formatProducts() {
        return this.products.map(product => `
            <div class="product-item">
                <strong>${product.name}</strong> (${product.category})<br>
                Tonnage: ${product.tonnage} tons<br>
                Available: ${product.sell_period.start} to ${product.sell_period.end}
            </div>
        `).join('<hr>');
    }

    getPopupContent() {
        return `
            <div class="popup-content">
                <h3>${this.name}</h3>
                <p><strong>Description:</strong> ${this.description}</p>
                <p><strong>Contact:</strong> ${this.contact}</p>
                <p><strong>Location:</strong> ${this.city}</p>
                <div class="products-section">
                    <h4>Products:</h4>
                    ${this.formatProducts()}
                </div>
            </div>
        `;
    }
}

window.LocationModel = LocationModel;