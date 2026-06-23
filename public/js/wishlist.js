// wishlist.js - Manages user favorite items
const wishlist = {
    items: [],

    init() {
        const stored = localStorage.getItem('ramdev_wishlist');
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch {
                this.items = [];
            }
        }
        this.updateUI();
    },

    save() {
        localStorage.setItem('ramdev_wishlist', JSON.stringify(this.items));
        this.updateUI();
    },

    toggle(productId) {
        const id = parseInt(productId);
        const index = this.items.indexOf(id);
        if (index > -1) {
            this.items.splice(index, 1);
            app.showToast("Removed from wishlist", "success");
        } else {
            this.items.push(id);
            app.showToast("Added to wishlist ❤️", "success");
        }
        this.save();
    },

    isFavorite(productId) {
        return this.items.includes(parseInt(productId));
    },

    updateUI() {
        // Update all heart icons on the page
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const id = parseInt(btn.getAttribute('data-id'));
            if (this.isFavorite(id)) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
                btn.style.color = '#e91e63';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
                btn.style.color = 'var(--text-muted)';
            }
        });
        
        // Render wishlist dashboard if active
        this.renderDashboard();
    },

    renderDashboard() {
        const container = document.getElementById('dashboard-wishlist-grid');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `<p class="empty-state">Your wishlist is empty. Browse the store and heart some products!</p>`;
            return;
        }

        const favProducts = shop.products.filter(p => this.items.includes(p.id));
        container.innerHTML = favProducts.map(p => {
            const finalPrice = p.price * (1 - p.discount_pct / 100);
            return `
                <div class="product-card">
                    <button class="wishlist-btn active" data-id="${p.id}" onclick="wishlist.toggle(${p.id})" style="position:absolute; top:10px; right:10px; background:white; border-radius:50%; width:30px; height:30px; border:none; box-shadow:0 2px 5px rgba(0,0,0,0.1); cursor:pointer; z-index:10; color:#e91e63;">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    <div class="product-img-wrapper" style="height:150px; overflow:hidden;">
                        <img src="${p.image_url}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="product-info" style="padding:10px;">
                        <h4 style="font-size:14px; margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</h4>
                        <div class="product-price">₹${finalPrice.toFixed(2)}</div>
                        <button class="btn btn-primary" style="width:100%; padding:5px; font-size:12px; margin-top:10px;" onclick="shop.showProductDetails(${p.id})">View Product</button>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    wishlist.init();
});
