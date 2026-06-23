// cart.js - Shopping Cart State and Drawer UI Handler
const cart = {
    items: [], // Array of { product_id, name, price, size, image, quantity }
    appliedCoupon: null, // Holds { code, type, value, description } if applied

    init() {
        const stored = localStorage.getItem('ramdev_cart');
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch {
                this.items = [];
            }
        }
        this.updateBadge();
        this.appliedCoupon = null; // Reset coupon on reload
    },

    save() {
        localStorage.setItem('ramdev_cart', JSON.stringify(this.items));
        this.updateBadge();
    },

    clear() {
        this.items = [];
        this.appliedCoupon = null;
        this.save();
        this.render();
    },

    getItems() {
        return this.items;
    },

    getItemsCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getDiscount() {
        if (!this.appliedCoupon) return 0;
        const subtotal = this.getSubtotal();
        if (this.appliedCoupon.type === 'percentage') {
            return parseFloat((subtotal * (this.appliedCoupon.value / 100)).toFixed(2));
        } else if (this.appliedCoupon.type === 'flat') {
            return parseFloat(this.appliedCoupon.value.toFixed(2));
        }
        return 0;
    },

    getTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        return Math.max(0, parseFloat((subtotal - discount).toFixed(2)));
    },

    add(product, size = "Standard") {
        if (product.stock <= 0) {
            app.showToast("This item is currently out of stock.", "error");
            return;
        }

        const finalPrice = product.price * (1 - product.discount_pct / 100);
        const existing = this.items.find(item => item.product_id === product.id && item.size === size);

        if (existing) {
            if (existing.quantity >= product.stock) {
                app.showToast(`Cannot add more. Only ${product.stock} items are in stock.`, "error");
                return;
            }
            existing.quantity += 1;
        } else {
            this.items.push({
                product_id: product.id,
                name: product.name,
                price: parseFloat(finalPrice.toFixed(2)),
                size,
                image: product.image_url,
                quantity: 1,
                maxStock: product.stock
            });
        }

        this.save();
        this.render();
        app.showToast(`Added "${product.name}" (${size}) to basket.`, "success");
    },

    updateQty(productId, size, change) {
        const item = this.items.find(i => i.product_id === parseInt(productId) && i.size === size);
        if (!item) return;

        item.quantity += change;

        if (item.quantity > item.maxStock) {
            app.showToast(`Only ${item.maxStock} items available in stock.`, "error");
            item.quantity = item.maxStock;
        }

        if (item.quantity <= 0) {
            this.items = this.items.filter(i => !(i.product_id === parseInt(productId) && i.size === size));
        }

        this.save();
        this.render();
        this.renderCheckoutSummary();
    },

    remove(productId, size) {
        this.items = this.items.filter(i => !(i.product_id === parseInt(productId) && i.size === size));
        this.save();
        this.render();
        this.renderCheckoutSummary();
        app.showToast("Item removed from basket.", "success");
    },

    updateBadge() {
        const count = this.getItemsCount();
        const badge = document.getElementById('cart-badge-count');
        if (badge) {
            badge.innerText = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    render() {
        const container = document.getElementById('cart-drawer-items');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty-message">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>Your shopping basket is empty</p>
                    <button class="btn btn-secondary" id="btn-cart-empty-shop" style="margin-top: 15px; font-size: 13px; padding: 8px 16px;">Shop Now</button>
                </div>
            `;
            
            const btn = document.getElementById('btn-cart-empty-shop');
            if (btn) {
                btn.addEventListener('click', () => {
                    app.toggleCartDrawer(false);
                    app.showView('home');
                });
            }

            document.getElementById('cart-subtotal-val').innerText = "0.00";
            document.getElementById('cart-total-val').innerText = "0.00";
            return;
        }

        container.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-meta">Size: ${item.size}</div>
                    <div class="cart-item-price-qty">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="cart.updateQty(${item.product_id}, '${item.size}', -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="cart.updateQty(${item.product_id}, '${item.size}', 1)">+</button>
                        </div>
                        <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="cart.remove(${item.product_id}, '${item.size}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');

        const subtotal = this.getSubtotal();
        const total = this.getTotal();
        document.getElementById('cart-subtotal-val').innerText = subtotal.toFixed(2);
        document.getElementById('cart-total-val').innerText = total.toFixed(2);
    },

    renderCheckoutSummary() {
        const container = document.getElementById('checkout-items-list');
        const subtotalSpan = document.getElementById('checkout-subtotal');
        const discountSpan = document.getElementById('checkout-discount');
        const discountRow = document.getElementById('checkout-discount-row');
        const totalSpan = document.getElementById('checkout-total');
        
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 14px;">No items selected.</p>`;
            if (subtotalSpan) subtotalSpan.innerText = "0.00";
            if (totalSpan) totalSpan.innerText = "0.00";
            if (discountRow) discountRow.style.display = "none";
            return;
        }

        container.innerHTML = this.items.map(item => `
            <div class="summary-item" style="margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <div style="max-width: 70%;">
                    <div style="font-weight: 700; font-size: 13px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">Size: ${item.size} | Qty: ${item.quantity}</div>
                </div>
                <div style="font-weight: 700; font-size: 13px; color: var(--accent-copper);">₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        const total = this.getTotal();

        if (subtotalSpan) subtotalSpan.innerText = subtotal.toFixed(2);
        
        if (discount > 0) {
            if (discountSpan) discountSpan.innerText = discount.toFixed(2);
            if (discountRow) discountRow.style.display = "flex";
        } else {
            if (discountRow) discountRow.style.display = "none";
        }

        if (totalSpan) totalSpan.innerText = total.toFixed(2);
    },

    applyShareCoupon() {
        this.appliedCoupon = {
            code: "SHARE5",
            type: "percentage",
            value: 5,
            description: "WhatsApp Sharing Reward (5% OFF)"
        };
        this.save();
        this.render();
        this.renderCheckoutSummary();
        app.showToast(app.currentLanguage === 'hi' ? 'व्हाट्सएप साझा करने के लिए धन्यवाद! 5% की छूट लागू हो गई है।' : 'Thanks for sharing! 5% Discount has been applied.', 'success');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    cart.init();
});
