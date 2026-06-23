// app.js - SPA Router, UI State, and Global Orchestrator
const app = {
    currentView: "home",
    user: null,

    init() {
        this.user = api.getUser();
        this.setupThemes();
        this.setupNavigation();
        this.setupAuthForms();
        this.setupModalClosers();
        this.renderUserArea();
        this.setupCheckoutForm();
        this.setupHamburgerDrawer();
    },

    // --- View Router ---
    showView(viewName) {
        document.querySelectorAll('.page-view').forEach(view => {
            view.style.display = 'none';
        });

        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.style.display = 'block';
            this.currentView = viewName;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (viewName === 'admin') {
                admin.loadDashboard();
            } else if (viewName === 'customer-dashboard') {
                this.loadCustomerDashboard();
            }
        }
    },

    setupNavigation() {
        // Logo Click
        document.getElementById('nav-logo').addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('home');
        });

        // Hero Button Shop
        const heroShopBtn = document.getElementById('btn-hero-shop');
        if (heroShopBtn) {
            heroShopBtn.addEventListener('click', () => {
                const shopTop = document.querySelector('.shop-section').offsetTop;
                window.scrollTo({ top: shopTop - 80, behavior: 'smooth' });
            });
        }

        // Checkout Button in Cart Drawer
        document.getElementById('cart-checkout-btn').addEventListener('click', () => {
            this.handleCheckoutNavigation();
        });

        // Continue Shopping Button on Success page
        document.getElementById('btn-success-back-home').addEventListener('click', () => {
            this.showView('home');
        });

        // Sub-Header quick links
        const subMenuAll = document.getElementById('sub-menu-all');
        if (subMenuAll) {
            subMenuAll.addEventListener('click', (e) => {
                e.preventDefault();
                shop.resetFilters();
                this.showView('home');
            });
        }

        const subMenuDeals = document.getElementById('sub-menu-deals');
        if (subMenuDeals) {
            subMenuDeals.addEventListener('click', (e) => {
                e.preventDefault();
                shop.resetFilters();
                // Filter products that have more than 10% discount
                shop.products = shop.products.filter(p => p.discount_pct >= 10);
                shop.renderCatalog();
                const shopTop = document.querySelector('.shop-section').offsetTop;
                window.scrollTo({ top: shopTop - 80, behavior: 'smooth' });
            });
        }

        document.querySelectorAll('.cat-sub-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = link.getAttribute('data-cat');
                this.filterCategoryQuick(cat);
            });
        });

        // Footer category links
        document.querySelectorAll('.cat-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = link.getAttribute('data-cat');
                this.filterCategoryQuick(cat);
            });
        });

        // Coupon application binding
        const couponBtn = document.getElementById('btn-apply-coupon');
        if (couponBtn) {
            couponBtn.addEventListener('click', () => {
                this.applyCouponCode();
            });
        }

        // Close search suggestions when clicking anywhere outside
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.search-bar-container');
            const suggestionsBox = document.getElementById('search-suggestions');
            if (searchContainer && !searchContainer.contains(e.target)) {
                if (suggestionsBox) suggestionsBox.classList.remove('open');
            }
        });
    },

    filterCategoryQuick(cat) {
        shop.selectedCategory = cat;
        const catCards = document.getElementById('categories-list');
        if (catCards) {
            catCards.querySelectorAll('.category-card').forEach(card => {
                if (card.getAttribute('data-category') === cat) {
                    card.style.borderColor = "var(--accent-copper)";
                    card.classList.add('active');
                } else {
                    card.style.borderColor = "var(--border-color)";
                    card.classList.remove('active');
                }
            });
        }

        shop.loadProducts();
        const shopTop = document.querySelector('.shop-section').offsetTop;
        window.scrollTo({ top: shopTop - 80, behavior: 'smooth' });
    },

    handleCheckoutNavigation() {
        if (cart.getItems().length === 0) {
            this.showToast("Your basket is empty. Please add items to checkout.", "error");
            return;
        }

        this.toggleCartDrawer(false);

        if (!this.user) {
            this.showToast("Please login to proceed to checkout.", "error");
            this.toggleAuthModal(true);
            return;
        }

        document.getElementById('shipping-name').value = this.user.name;

        cart.appliedCoupon = null;
        const activeContainer = document.getElementById('coupon-active-container');
        if (activeContainer) activeContainer.innerHTML = "";
        const couponInput = document.getElementById('coupon-code-input');
        if (couponInput) couponInput.value = "";

        cart.renderCheckoutSummary();
        this.showView('checkout');
    },

    // --- Amazon Left Hamburger Drawer ---
    setupHamburgerDrawer() {
        const trigger = document.getElementById('left-hamburger-btn');
        const close = document.getElementById('left-drawer-close-btn');
        const overlay = document.getElementById('drawer-blur-overlay');

        if (trigger) trigger.addEventListener('click', () => this.toggleHamburgerDrawer(true));
        if (close) close.addEventListener('click', () => this.toggleHamburgerDrawer(false));
        if (overlay) overlay.addEventListener('click', () => this.toggleHamburgerDrawer(false));

        // Category clicks in sidebar drawer
        document.querySelectorAll('.cat-drawer-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = link.getAttribute('data-cat');
                this.toggleHamburgerDrawer(false);
                this.filterCategoryQuick(cat);
            });
        });

        // Material clicks in sidebar drawer
        document.querySelectorAll('.mat-drawer-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const mat = link.getAttribute('data-mat');
                this.toggleHamburgerDrawer(false);
                
                // Reset categories, check the specific material box
                shop.resetFilters();
                const matCheckboxes = document.getElementById('filter-materials');
                if (matCheckboxes) {
                    matCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                        if (cb.value === mat) {
                            cb.checked = true;
                        }
                    });
                }
                shop.selectedMaterials = [mat];
                shop.loadProducts();
                const shopTop = document.querySelector('.shop-section').offsetTop;
                window.scrollTo({ top: shopTop - 80, behavior: 'smooth' });
            });
        });
    },

    toggleHamburgerDrawer(open) {
        const drawer = document.getElementById('left-hamburger-drawer');
        const overlay = document.getElementById('drawer-blur-overlay');
        
        if (!drawer || !overlay) return;

        if (open) {
            drawer.classList.add('open');
            overlay.classList.add('open');
        } else {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
        }
    },

    // --- Coupon Codes Actions ---
    async applyCouponCode() {
        const input = document.getElementById('coupon-code-input');
        const activeContainer = document.getElementById('coupon-active-container');
        if (!input || !activeContainer) return;

        const code = input.value.trim().toUpperCase();
        if (!code) {
            this.showToast("Please enter a coupon code.", "error");
            return;
        }

        try {
            const coupon = await api.applyCoupon(code);
            cart.appliedCoupon = coupon;
            
            activeContainer.innerHTML = `
                <div class="coupon-active-badge">
                    <i class="fa-solid fa-tag"></i> Code: ${coupon.code} - ${coupon.description}
                    <button type="button" onclick="app.removeCouponCode()">×</button>
                </div>
            `;
            input.value = "";
            cart.renderCheckoutSummary();
            this.showToast(`Coupon "${code}" applied successfully!`, "success");
        } catch (err) {
            this.showToast(err.message, "error");
            activeContainer.innerHTML = `<span style="color:#d32f2f; font-size:12px; margin-top:5px; display:block;">${err.message}</span>`;
        }
    },

    removeCouponCode() {
        cart.appliedCoupon = null;
        const activeContainer = document.getElementById('coupon-active-container');
        if (activeContainer) activeContainer.innerHTML = "";
        cart.renderCheckoutSummary();
        this.showToast("Coupon code removed.", "success");
    },

    // --- Customer Dashboard Details Loader ---
    async loadCustomerDashboard() {
        const nameLabel = document.getElementById('profile-user-name');
        const emailLabel = document.getElementById('profile-user-email');
        const listContainer = document.getElementById('customer-orders-list');
        
        if (!this.user) return;
        
        if (nameLabel) nameLabel.innerText = this.user.name;
        if (emailLabel) emailLabel.innerText = this.user.email;
        if (!listContainer) return;

        listContainer.innerHTML = `<p style="color: var(--text-muted); font-size:13px;">Retrieving purchases history...</p>`;

        try {
            const orders = await api.getOrders();
            
            if (orders.length === 0) {
                listContainer.innerHTML = `<p style="color: var(--text-muted); font-size:13px; padding:20px 0;">You haven't placed any orders yet.</p>`;
                return;
            }

            listContainer.innerHTML = orders.map(order => {
                const dateStr = new Date(order.order_date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                const itemsHtml = order.items.map(item => `
                    <div class="customer-order-item-row">
                        <img src="${item.product_image}" alt="${item.product_name}" onerror="this.src='https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop'">
                        <div class="customer-order-item-details">
                            <p class="customer-order-item-title">${item.product_name}</p>
                            <span class="customer-order-item-meta">Size: ${item.size} | Qty: ${item.quantity}</span>
                        </div>
                        <span class="customer-order-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');

                return `
                    <div class="customer-order-card">
                        <div class="customer-order-header" onclick="app.toggleOrderAccordion(this)">
                            <div>
                                <span>Order Placed</span>
                                <p>${dateStr}</p>
                            </div>
                            <div>
                                <span>Order ID</span>
                                <p>${order.id}</p>
                            </div>
                            <div>
                                <span>Total Paid</span>
                                <p>₹${order.total_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <span>Status</span>
                                <p style="color: ${order.status === 'Delivered' ? '#2e7d32' : '#cca43b'};">${order.status}</p>
                            </div>
                        </div>
                        <div class="customer-order-body" style="display: none;">
                            <h4 style="font-size:13px; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:12px; color:var(--primary-bronze);">Items Ordered</h4>
                            <div class="customer-order-items-grid">
                                ${itemsHtml}
                            </div>
                            ${order.discount_amount > 0 ? `
                                <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:15px; padding-top:10px; border-top:1px dashed var(--border-color); color:var(--accent-green); font-weight:700;">
                                    <span>Coupon Code Applied: ${order.coupon_code}</span>
                                    <span>Discount Savings: -₹${order.discount_amount.toFixed(2)}</span>
                                </div>
                            ` : ''}
                            <div style="font-size:11px; margin-top:15px; color:var(--text-muted); background:var(--bg-cream); padding:10px; border-radius:6px;">
                                <strong>Delivery Address:</strong> ${order.shipping_address}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            listContainer.innerHTML = `<p style="color: #d32f2f; font-size:13px;">Failed to load order history.</p>`;
        }
    },

    toggleOrderAccordion(headerEl) {
        const body = headerEl.nextElementSibling;
        if (body.style.display === 'none') {
            body.style.display = 'block';
        } else {
            body.style.display = 'none';
        }
    },

    // --- Theme Controller ---
    setupThemes() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        const savedTheme = localStorage.getItem('ramdev_theme');

        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (toggleBtn) {
                toggleBtn.innerHTML = `<i class="fa-solid fa-sun" style="color: var(--accent-gold);"></i>`;
            }
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark-mode');
                if (isDark) {
                    localStorage.setItem('ramdev_theme', 'dark');
                    toggleBtn.innerHTML = `<i class="fa-solid fa-sun" style="color: var(--accent-gold);"></i>`;
                    this.showToast("Dark Mode Activated", "success");
                } else {
                    localStorage.setItem('ramdev_theme', 'light');
                    toggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
                    this.showToast("Light Mode Activated", "success");
                }
                
                if (this.currentView === 'admin') {
                    admin.renderChart();
                }
            });
        }
    },

    // --- Authentication Modals ---
    setupAuthForms() {
        document.getElementById('btn-toggle-signup').addEventListener('click', () => {
            document.getElementById('auth-login-box').style.display = 'none';
            document.getElementById('auth-signup-box').style.display = 'block';
        });

        document.getElementById('btn-toggle-login').addEventListener('click', () => {
            document.getElementById('auth-signup-box').style.display = 'none';
            document.getElementById('auth-login-box').style.display = 'block';
        });

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;

            try {
                const user = await api.login(email, pass);
                this.user = user;
                this.showToast(`Welcome back, ${user.name}!`, "success");
                this.toggleAuthModal(false);
                this.renderUserArea();
                
                if (this.currentView === 'checkout' || (this.currentView === 'home' && cart.getItemsCount() > 0)) {
                    this.handleCheckoutNavigation();
                }
            } catch (err) {
                this.showToast(err.message, "error");
            }
        });

        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-password').value;

            try {
                const user = await api.register(name, email, pass);
                this.user = user;
                this.showToast("Account created successfully!", "success");
                this.toggleAuthModal(false);
                this.renderUserArea();
            } catch (err) {
                this.showToast(err.message, "error");
            }
        });
    },

    renderUserArea() {
        const area = document.getElementById('user-nav-area');
        const drawerUser = document.getElementById('left-drawer-user-info');
        const drawerAdminSec = document.getElementById('drawer-admin-section');
        
        if (!area) return;

        if (this.user) {
            // Draw profile links/dashboard settings in header
            area.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 13px; font-weight: 600; cursor:pointer;" onclick="app.showView('customer-dashboard')" class="user-welcome-label hover-gold" title="View Account Dashboard">
                        Hello, ${this.user.name.split(' ')[0]}
                    </span>
                    ${this.user.role === 'admin' ? `
                        <button class="nav-btn" onclick="app.showView('admin')" title="Admin Dashboard">
                            <i class="fa-solid fa-screwdriver-wrench"></i>
                        </button>
                    ` : `
                        <button class="nav-btn" onclick="app.showView('customer-dashboard')" title="My Orders Dashboard">
                            <i class="fa-solid fa-receipt"></i>
                        </button>
                    `}
                    <button class="nav-btn" onclick="app.handleLogout()" title="Logout">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            `;
            if (document.body.classList.contains('dark-mode')) {
                const label = area.querySelector('.user-welcome-label');
                if (label) label.style.color = 'var(--accent-gold)';
            }

            // Sync left-drawer user info
            if (drawerUser) {
                drawerUser.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fa-solid fa-circle-user"></i> Hello, ${this.user.name.split(' ')[0]}
                    </div>
                    <button class="left-drawer-close" id="left-drawer-close-btn" onclick="app.toggleHamburgerDrawer(false)"><i class="fa-solid fa-xmark"></i></button>
                `;
            }

            // Sync left-drawer admin link
            if (drawerAdminSec) {
                drawerAdminSec.innerHTML = `
                    ${this.user.role === 'admin' ? `
                        <a href="#" class="drawer-link" onclick="app.toggleHamburgerDrawer(false); app.showView('admin')"><i class="fa-solid fa-screwdriver-wrench"></i> Admin Dashboard</a>
                    ` : `
                        <a href="#" class="drawer-link" onclick="app.toggleHamburgerDrawer(false); app.showView('customer-dashboard')"><i class="fa-solid fa-receipt"></i> My Order Dashboard</a>
                    `}
                    <a href="#" class="drawer-link" onclick="app.toggleHamburgerDrawer(false); app.handleLogout()"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out</a>
                `;
            }
        } else {
            // Header login link
            area.innerHTML = `<a href="#" class="auth-nav-link" onclick="app.toggleAuthModal(true); return false;">Login</a>`;

            // Sync left-drawer user info
            if (drawerUser) {
                drawerUser.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="app.toggleHamburgerDrawer(false); app.toggleAuthModal(true);">
                        <i class="fa-solid fa-circle-user"></i> Hello, Sign In
                    </div>
                    <button class="left-drawer-close" id="left-drawer-close-btn" onclick="app.toggleHamburgerDrawer(false)"><i class="fa-solid fa-xmark"></i></button>
                `;
            }

            // Clear left-drawer admin link
            if (drawerAdminSec) {
                drawerAdminSec.innerHTML = `
                    <a href="#" class="drawer-link" onclick="app.toggleHamburgerDrawer(false); app.toggleAuthModal(true)"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Account</a>
                `;
            }
        }
    },

    handleLogout() {
        api.logout();
        this.user = null;
        this.showToast("Logged out successfully.", "success");
        this.renderUserArea();
        this.showView('home');
    },

    setupCheckoutForm() {
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.processCheckout();
            });
        }
    },

    async processCheckout() {
        if (cart.getItems().length === 0) return;

        const shippingInfo = {
            name: document.getElementById('shipping-name').value,
            address: document.getElementById('shipping-address').value,
            payment_method: document.getElementById('shipping-payment').value
        };

        const couponCode = cart.appliedCoupon ? cart.appliedCoupon.code : "";

        try {
            const order = await api.checkout(shippingInfo, cart.getItems(), couponCode);
            this.showToast("Order placed successfully!", "success");
            
            this.renderInvoiceReceipt(order);
            cart.clear();
            this.showView('success');
        } catch (err) {
            this.showToast(err.message, "error");
        }
    },

    renderInvoiceReceipt(order) {
        const container = document.getElementById('invoice-details-content');
        if (!container) return;

        const dateStr = new Date(order.order_date).toLocaleString('en-US');
        
        let itemsHtml = order.items.map(item => {
            const prod = shop.products.find(p => p.id === item.product_id);
            const name = prod ? prod.name : "Utensil Item";
            return `${name.substring(0, 30).padEnd(32)} x${item.quantity.toString().padEnd(2)}   ₹${(item.price * item.quantity).toFixed(2).padStart(8)}`;
        }).join('\n');

        container.innerHTML = `
<pre style="margin: 0; line-height: 1.4;">
================================================
              RAMDEV SUPER STORE                
        Traditional Cookware & Utensils        
================================================
Invoice No   : ${order.id}
Date         : ${dateStr}
Customer     : ${order.shipping_name}
Payment Mode : ${order.payment_method}
================================================
ITEM DESCRIPTION                 QTY      AMOUNT
------------------------------------------------
${itemsHtml}
================================================
Subtotal                               ₹${(order.total_amount + order.discount_amount).toFixed(2).padStart(8)}
${order.discount_amount > 0 ? `Coupon Discount (${order.coupon_code})        -₹${order.discount_amount.toFixed(2).padStart(8)}` : `Coupon Discount                        -₹${(0).toFixed(2).padStart(8)}`}
Grand Total                            ₹${order.total_amount.toFixed(2).padStart(8)}
================================================
Shipping Address:
${order.shipping_address}
================================================
   * Thank you for choosing healthy living! *   
================================================
</pre>
        `;
    },

    toggleAuthModal(open) {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            if (open) {
                modal.classList.add('open');
                document.getElementById('auth-signup-box').style.display = 'none';
                document.getElementById('auth-login-box').style.display = 'block';
            } else {
                modal.classList.remove('open');
            }
        }
    },

    toggleDetailModal(open) {
        const modal = document.getElementById('product-detail-modal');
        if (modal) {
            if (open) modal.classList.add('open');
            else modal.classList.remove('open');
        }
    },

    toggleCartDrawer(open) {
        const drawer = document.getElementById('shopping-cart-drawer');
        if (drawer) {
            if (open) drawer.classList.add('open');
            else drawer.classList.remove('open');
        }
    },

    toggleAdminProductModal(open) {
        const modal = document.getElementById('admin-product-modal');
        if (modal) {
            if (open) modal.classList.add('open');
            else modal.classList.remove('open');
        }
    },

    setupModalClosers() {
        document.getElementById('cart-toggle-btn').addEventListener('click', () => this.toggleCartDrawer(true));
        document.getElementById('cart-close-btn').addEventListener('click', () => this.toggleCartDrawer(false));

        document.getElementById('btn-close-detail-modal').addEventListener('click', () => this.toggleDetailModal(false));

        document.getElementById('btn-close-auth-modal').addEventListener('click', () => this.toggleAuthModal(false));

        document.getElementById('btn-close-admin-product-modal').addEventListener('click', () => this.toggleAdminProductModal(false));

        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                }
            });
        });
    },

    showToast(message, type = "success") {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') {
            icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
        }

        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
