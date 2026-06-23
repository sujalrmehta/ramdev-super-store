// app.js - SPA Router, UI State, and Global Orchestrator

const TRANSLATIONS = {
    en: {
        hero1_title: "Royal Golden Brass Dinnerware",
        hero1_desc: "Experience traditional wellness and royal elegance with our handcrafted Ayurvedic brass plates, bowls, and glasses.",
        hero2_title: "Pure Hammered Copper Vessels",
        hero2_desc: "Boost your daily immunity and digestion. Storing water in copper is a time-tested Ayurvedic wellness practice.",
        hero3_title: "Pre-Seasoned Cast Iron Woks",
        hero3_desc: "Traditional hand-cast iron kadhais and skillets. Infuses your recipes with dietary iron naturally.",
        shop_now: "Shop Collection",
        crafts_title: "Artisanal Heritage of India",
        crafts_desc: "Handcrafted with love by traditional master artisans across regional India",
        craft1_title: "Moradabad Brass Craft",
        craft1_desc: "Sourced from Uttar Pradesh's famous 'Peetal Nagri'. Hammered and polished by hand using generation-old sand casting techniques.",
        craft2_title: "Ayurvedic Hammered Copper",
        craft2_desc: "Crafted by Maharashtra's traditional copper-smiths. Hammered textures maximize surface contact to purify drinking water.",
        craft3_title: "Sinnamani Cast Iron",
        craft3_desc: "Traditional heavy kadhais sand-cast in Tamil Nadu. Double organic pre-seasoning with sesame oil for a non-stick finish.",
        upi_payment: "UPI Payment",
        upi_instructions: "Scan this QR code using Google Pay, PhonePe, Paytm or BHIM UPI to complete payment.",
        simulate_success: "Simulate Payment Success",
        all_products: "All Products"
    },
    hi: {
        hero1_title: "शाही सुनहरे पीतल के बर्तन",
        hero1_desc: "हमारे हस्तनिर्मित आयुर्वेदिक पीतल की थाली, कटोरी और गिलास के साथ पारंपरिक कल्याण और शाही लालित्य का अनुभव करें।",
        hero2_title: "शुद्ध तांबे के बर्तन",
        hero2_desc: "अपनी दैनिक प्रतिरक्षा और पाचन को बढ़ावा दें। तांबे में पानी का संग्रहण एक समय-परीक्षित आयुर्वेदिक स्वास्थ्य अभ्यास है।",
        hero3_title: "कास्ट आयरन कड़ाही",
        hero3_desc: "पारंपरिक हाथ से बनी लोहे की कड़ाही। प्राकृतिक रूप से आपके भोजन में आयरन की मात्रा बढ़ाए।",
        shop_now: "अभी खरीदें",
        crafts_title: "भारत की हस्तशिल्प विरासत",
        crafts_desc: "क्षेत्रीय भारत के पारंपरिक कारीगरों द्वारा हस्तनिर्मित",
        craft1_title: "मुरादाबाद पीतल शिल्प",
        craft1_desc: "उत्तर प्रदेश की प्रसिद्ध 'पीतल नगरी' से लाया गया। पारंपरिक रेत ढलाई तकनीकों का उपयोग करके हाथ से बनाया गया।",
        craft2_title: "आयुर्वेदिक तांबा",
        craft2_desc: "महाराष्ट्र के तांबे के कारीगरों द्वारा निर्मित। पानी को शुद्ध करने के लिए हाथ से बनाई गई तांबे की बनावट।",
        craft3_title: "चिन्नामणी कास्ट आयरन",
        craft3_desc: "तमिलनाडु में निर्मित पारंपरिक भारी लोहे की कड़ाही। चिपचिपा-मुक्त बनाने के लिए तिल के तेल से जैविक पॉलिश।",
        upi_payment: "यूपीआई भुगतान",
        upi_instructions: "भुगतान पूरा करने के लिए Google Pay, PhonePe, Paytm या BHIM UPI का उपयोग करके इस QR कोड को स्कैन करें।",
        simulate_success: "सफल भुगतान का अनुकरण करें",
        all_products: "सभी उत्पाद"
    }
};

const HEALTH_BENEFITS = {
    "Copper": "<h3>Ayurvedic Health Benefits of Copper:</h3><ul><li><strong>Aids Digestion:</strong> Storing water in copper bottom handi or jugs overnight cleanses the stomach.</li><li><strong>Strengthens Immunity:</strong> Copper has natural anti-microbial and anti-inflammatory properties.</li><li><strong>Promotes Bone Strength:</strong> Copper is essential for melanin production and absorption of iron.</li></ul>",
    "Brass": "<h3>Ayurvedic Health Benefits of Brass (Peetal):</h3><ul><li><strong>Nutritional Value:</strong> Brass retains up to 70% of food nutrients during cooking.</li><li><strong>Melanin Regulation:</strong> Helps maintain healthy skin and hair pigment.</li><li><strong>Pacifies Pitta:</strong> Traditional brass dinnerware is recommended to balance body humors.</li></ul>",
    "Cast Iron": "<h3>Health Benefits of Cast Iron Cookware:</h3><ul><li><strong>Natural Iron Infusion:</strong> Infuses dietary iron into slow-cooked gravies and dishes.</li><li><strong>Sesame Seasoning:</strong> Completely organic and chemical-free, unlike Teflon coatings.</li><li><strong>Uniform Heating:</strong> Retains heat longer, requiring less oil for cooking.</li></ul>",
    "Stainless Steel": "<h3>Benefits of Tri-Ply Stainless Steel:</h3><ul><li><strong>Non-Reactive Cooking:</strong> Does not react with acidic foods like tomatoes or vinegar.</li><li><strong>Eco-Friendly & Durable:</strong> 100% rustproof and lasts for generations.</li><li><strong>Fast Heat Transfer:</strong> Multi-layered core saves cooking gas and electricity.</li></ul>",
    "Clay": "<h3>Ayurvedic Health Benefits of Earthenware/Clay:</h3><ul><li><strong>Alkalizes Food:</strong> Alkaline clay neutralizes acidic values in food.</li><li><strong>Retains Moisture:</strong> Micro-pores allow steam condensation, keeping food tender.</li><li><strong>Pure Organic Composition:</strong> Free from lead and toxic chemical glazes.</li></ul>"
};

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
        this.initCarousel();
        this.initLanguage();
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
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Apply theme on load based on saved preference or system setting
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            if (toggleBtn) {
                toggleBtn.innerHTML = `<i class="fa-solid fa-sun" style="color: var(--accent-gold);"></i> <span>Theme</span>`;
            }
        } else {
            if (toggleBtn) {
                toggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i> <span>Theme</span>`;
            }
        }

        // Listen for system theme changes if user hasn't explicitly set a preference
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('ramdev_theme')) {
                    if (e.matches) {
                        document.body.classList.add('dark-mode');
                        if (toggleBtn) toggleBtn.innerHTML = `<i class="fa-solid fa-sun" style="color: var(--accent-gold);"></i> <span>Theme</span>`;
                    } else {
                        document.body.classList.remove('dark-mode');
                        if (toggleBtn) toggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i> <span>Theme</span>`;
                    }
                }
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark-mode');
                if (isDark) {
                    localStorage.setItem('ramdev_theme', 'dark');
                    toggleBtn.innerHTML = `<i class="fa-solid fa-sun" style="color: var(--accent-gold);"></i> <span>Theme</span>`;
                    this.showToast("Dark Mode Activated", "success");
                } else {
                    localStorage.setItem('ramdev_theme', 'light');
                    toggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i> <span>Theme</span>`;
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
        const total = cart.getTotal();

        if (shippingInfo.payment_method === 'UPI Pay') {
            // Save checkout data for after payment completes
            this._pendingCheckoutData = {
                shippingInfo,
                items: cart.getItems(),
                couponCode
            };
            this.openUpiModal(total);
            return;
        }

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
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    },

    // --- Carousel Controller ---
    carouselIndex: 0,
    carouselInterval: null,

    initCarousel() {
        this.startCarouselAutoplay();
    },

    startCarouselAutoplay() {
        if (this.carouselInterval) clearInterval(this.carouselInterval);
        this.carouselInterval = setInterval(() => {
            this.moveCarousel(1);
        }, 5000);
    },

    moveCarousel(direction) {
        const items = document.querySelectorAll('.hero-carousel .carousel-item');
        const dots = document.querySelectorAll('.hero-carousel .carousel-dot');
        if (!items.length) return;

        items[this.carouselIndex].classList.remove('active');
        if (dots[this.carouselIndex]) dots[this.carouselIndex].classList.remove('active');

        this.carouselIndex = (this.carouselIndex + direction + items.length) % items.length;

        items[this.carouselIndex].classList.add('active');
        if (dots[this.carouselIndex]) dots[this.carouselIndex].classList.add('active');
        
        this.startCarouselAutoplay(); // Reset timer
    },

    setCarouselSlide(index) {
        const items = document.querySelectorAll('.hero-carousel .carousel-item');
        const dots = document.querySelectorAll('.hero-carousel .carousel-dot');
        if (!items.length || index < 0 || index >= items.length) return;

        items[this.carouselIndex].classList.remove('active');
        if (dots[this.carouselIndex]) dots[this.carouselIndex].classList.remove('active');

        this.carouselIndex = index;

        items[this.carouselIndex].classList.add('active');
        if (dots[this.carouselIndex]) dots[this.carouselIndex].classList.add('active');

        this.startCarouselAutoplay(); // Reset timer
    },

    scrollToCatalog() {
        const catalogEl = document.getElementById('categories-list');
        if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    // --- Language Translation System ---
    currentLanguage: 'en',

    initLanguage() {
        const savedLang = localStorage.getItem('ramdev_language') || 'en';
        this.currentLanguage = savedLang;
        const selector = document.getElementById('lang-select');
        if (selector) selector.value = savedLang;
        this.translatePage();
    },

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('ramdev_language', lang);
        this.translatePage();
        // Re-render catalog to translate category tabs
        if (typeof shop !== 'undefined' && typeof shop.renderCatalog === 'function') {
            shop.renderCatalog();
        }
    },

    translatePage() {
        const dict = TRANSLATIONS[this.currentLanguage];
        if (!dict) return;

        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (dict[key]) {
                el.innerText = dict[key];
            }
        });
    },

    // --- Show/Hide Password Toggle ---
    togglePassword(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    // --- Pincode Estimator Logic ---
    checkPincode(productId) {
        const input = document.getElementById(`pincode-input-${productId}`);
        const feedback = document.getElementById(`pincode-feedback-${productId}`);
        if (!input || !feedback) return;

        const pin = input.value.trim();
        if (!/^\d{6}$/.test(pin)) {
            feedback.style.color = '#EF4444';
            feedback.innerText = this.currentLanguage === 'hi' ? 'कृपया 6 अंकों का वैध पिनकोड दर्ज करें।' : 'Please enter a valid 6-digit Pincode.';
            return;
        }

        const firstDigit = pin[0];
        let days = 3;
        if (firstDigit === '1' || firstDigit === '2') {
            days = 2; // North India
        } else if (firstDigit === '3' || firstDigit === '4') {
            days = 3; // West India
        } else if (firstDigit === '5' || firstDigit === '6') {
            days = 2; // South India
        } else {
            days = 4; // East / North-East / Central
        }

        feedback.style.color = 'var(--accent-green)';
        feedback.innerText = this.currentLanguage === 'hi' ? 
            `पिनकोड ${pin} पर डिलीवरी: ${days} दिनों में (फ्री शिपिंग)` : 
            `Delivering to ${pin} in ${days} Days (FREE Shipping)`;
    },

    // --- Health Benefits Modal ---
    openHealthModal(material) {
        const overlay = document.getElementById('health-modal-overlay');
        const title = document.getElementById('health-modal-title');
        const content = document.getElementById('health-modal-content');
        if (!overlay || !title || !content) return;

        const details = HEALTH_BENEFITS[material] || "<h3>Health benefits guide:</h3><p>Traditional cookware enhances natural wellness.</p>";
        title.innerHTML = `<i class="fa-solid fa-heart-pulse"></i> ${material} Ayurveda Guide`;
        content.innerHTML = details;
        overlay.classList.add('active');
    },

    closeHealthModal() {
        const overlay = document.getElementById('health-modal-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    // --- UPI QR Code Modal ---
    openUpiModal(amount) {
        const overlay = document.getElementById('upi-modal-overlay');
        const amtSpan = document.getElementById('upi-modal-amount');
        const qrImg = document.getElementById('upi-qr-img');
        if (!overlay || !amtSpan || !qrImg) return;

        amtSpan.innerText = amount.toFixed(2);
        
        const upiUrl = `upi://pay?pa=ramdevstore@ybl%26pn=Ramdev%2520Super%2520Store%26am=${amount.toFixed(2)}%26cu=INR`;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

        overlay.classList.add('active');
    },

    closeUpiModal() {
        const overlay = document.getElementById('upi-modal-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    simulateUpiSuccess() {
        this.closeUpiModal();
        this.showToast(this.currentLanguage === 'hi' ? 'यूपीआई भुगतान सफल रहा!' : 'UPI Payment Simulated Successfully!');
        
        if (this._pendingCheckoutData) {
            const { shippingInfo, items, couponCode } = this._pendingCheckoutData;
            this.submitOrderAfterPayment(shippingInfo, items, couponCode);
        }
    },

    async submitOrderAfterPayment(shippingInfo, items, couponCode) {
        try {
            const order = await api.checkout(shippingInfo, items, couponCode);
            this.showToast("Order placed successfully!", "success");
            
            this.renderInvoiceReceipt(order);
            cart.clear();
            this.showView('success');
            this._pendingCheckoutData = null;
        } catch (err) {
            this.showToast(err.message || 'Error creating order.', 'error');
        }
    },

    // --- Bilingual Voice Search Controller ---
    recognition: null,

    startVoiceSearch() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.showToast(this.currentLanguage === 'hi' ? 'आपका ब्राउज़र वॉयस सर्च का समर्थन नहीं करता है।' : 'Your browser does not support Voice Search.', 'error');
            return;
        }

        const overlay = document.getElementById('voice-modal-overlay');
        const statusText = document.getElementById('voice-status-text');
        const instructionText = document.getElementById('voice-instructions-text');
        if (!overlay || !statusText || !instructionText) return;

        statusText.innerText = this.currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 'Listening...';
        instructionText.innerText = this.currentLanguage === 'hi' ? 'बोलिए (जैसे: पीतल की थाली या तांबे की बोतल)' : 'Speak now (e.g. Brass Plate or Copper Jug)';
        overlay.classList.add('active');

        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log(`Speech recognized: ${transcript}`);
            statusText.innerText = this.currentLanguage === 'hi' ? `पहचाना गया: "${transcript}"` : `Recognized: "${transcript}"`;
            
            // Put transcript in search input and trigger search
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = transcript;
                searchInput.dispatchEvent(new Event('input'));
                
                // If shop.js handles search filtering:
                if (typeof shop !== 'undefined' && typeof shop.handleSearch === 'function') {
                    shop.handleSearch(transcript);
                } else if (typeof shop !== 'undefined') {
                    // Fallback search trigger
                    shop.searchQuery = transcript;
                    shop.renderCatalog();
                }
            }

            setTimeout(() => {
                this.stopVoiceSearch();
            }, 1000);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            statusText.innerText = this.currentLanguage === 'hi' ? 'त्रुटि! फिर से कोशिश करें।' : 'Error! Try speaking again.';
            setTimeout(() => {
                this.stopVoiceSearch();
            }, 1500);
        };

        this.recognition.onend = () => {
            this.recognition = null;
        };

        this.recognition.start();
    },

    stopVoiceSearch() {
        const overlay = document.getElementById('voice-modal-overlay');
        if (overlay) overlay.classList.remove('active');

        if (this.recognition) {
            this.recognition.abort();
            this.recognition = null;
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
