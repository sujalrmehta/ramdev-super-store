// shop.js - Utensil Product Display and Filters Controller
const shop = {
    products: [],
    selectedCategory: "",
    selectedMaterials: [],
    maxPrice: 5000,
    sortBy: "default",
    searchQuery: "",
    debounceTimer: null,
    
    async init() {
        this.setupEventListeners();
        await this.loadProducts();
    },

    setupEventListeners() {

        // Categories Click Event
        const catContainer = document.getElementById('categories-list');
        if (catContainer) {
            catContainer.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', () => {
                    const cat = card.getAttribute('data-category');
                    
                    if (this.selectedCategory === cat) {
                        this.selectedCategory = "";
                        card.classList.remove('active');
                        card.style.borderColor = "var(--border-color)";
                    } else {
                        catContainer.querySelectorAll('.category-card').forEach(c => {
                            c.classList.remove('active');
                            c.style.borderColor = "var(--border-color)";
                        });
                        this.selectedCategory = cat;
                        card.classList.add('active');
                        card.style.borderColor = "var(--accent-copper)";
                    }
                    
                    this.loadProducts();
                });
            });
        }

        // Brand/Material Dropdown Filter
        const matSelect = document.getElementById('filter-materials-select');
        if (matSelect) {
            matSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                this.selectedMaterials = val ? [val] : [];
                this.loadProducts();
            });
        }

        // Size Dropdown Filter
        const sizeSelect = document.getElementById('filter-sizes-select');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', () => {
                this.loadProducts();
            });
        }

        // Sort Selector
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.loadProducts();
            });
        }

        // Global Reset Button
        const resetBtn = document.getElementById('btn-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Search Input & Suggestions dropdown triggers
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                
                // Show auto-suggestions immediately
                this.showSearchSuggestions(this.searchQuery);

                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.loadProducts();
                }, 400);
            });

            searchInput.addEventListener('focus', (e) => {
                this.showSearchSuggestions(e.target.value);
            });
        }
    },

    scrollToShop() {
        const shopTop = document.querySelector('.shop-section').offsetTop;
        window.scrollTo({ top: shopTop - 80, behavior: 'smooth' });
    },

    // (Legacy Carousel controls removed)

    resetFilters() {
        this.selectedCategory = "";
        this.selectedMaterials = [];
        this.maxPrice = 5000;
        this.sortBy = "default";
        this.searchQuery = "";

        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = "";

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = "default";

        const priceSlider = document.getElementById('filter-price-slider');
        if (priceSlider) priceSlider.value = 5000;
        const sliderLabelVal = document.getElementById('price-slider-value');
        if (sliderLabelVal) sliderLabelVal.innerText = "5000";

        const catContainer = document.getElementById('categories-list');
        if (catContainer) {
            catContainer.querySelectorAll('.category-card').forEach(c => {
                c.style.borderColor = "var(--border-color)";
                c.classList.remove('active');
            });
        }

        const matContainer = document.getElementById('filter-materials');
        if (matContainer) {
            matContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
        }

        this.loadProducts();
    },

    async loadProducts() {
        try {
            const filters = {
                search: this.searchQuery,
                category: this.selectedCategory,
                material: this.selectedMaterials.join(','),
                maxPrice: this.maxPrice,
                sortBy: this.sortBy
            };

            let productsList = await api.getProducts(filters);
            
            // Apply size filter in frontend if selected
            const sizeSelect = document.getElementById('filter-sizes-select');
            if (sizeSelect && sizeSelect.value) {
                const sizeVal = sizeSelect.value.toLowerCase();
                productsList = productsList.filter(p => {
                    if (!p.sizes) return false;
                    return p.sizes.toLowerCase().includes(sizeVal);
                });
            }

            this.products = productsList;
            this.renderCatalog();
        } catch (err) {
            app.showToast("Failed to retrieve inventory items.", "error");
        }
    },

    renderCatalog() {
        const grid = document.getElementById('products-catalog-grid');
        const countLabel = document.getElementById('product-list-count');
        if (!grid) return;

        if (countLabel) countLabel.innerText = this.products.length;

        if (this.products.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-cookie-bite" style="font-size: 48px; color: var(--border-color); margin-bottom: 15px;"></i>
                    <h3>No Utensils Found</h3>
                    <p style="margin-top: 8px;">Try modifying search parameters or resetting filters.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.products.map(product => {
            const finalPrice = product.price * (1 - product.discount_pct / 100);
            
            let starsHtml = "";
            const floorRating = Math.floor(product.rating);
            for (let i = 1; i <= 5; i++) {
                if (i <= floorRating) {
                    starsHtml += `<i class="fa-solid fa-star"></i>`;
                } else if (i === floorRating + 1 && product.rating % 1 >= 0.5) {
                    starsHtml += `<i class="fa-solid fa-star-half-stroke"></i>`;
                } else {
                    starsHtml += `<i class="fa-regular fa-star"></i>`;
                }
            }

            return `
                <div class="product-card">
                    ${product.discount_pct > 0 ? `<div class="product-badge">${product.discount_pct}% OFF</div>` : ''}
                    <div class="product-category-badge">${product.category}</div>
                    
                    <div class="product-image-wrapper" onclick="shop.openProductDetail(${product.id})">
                        <img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop'">
                    </div>
                    
                    <div class="product-info">
                        <span class="product-category">${product.category}</span>
                        <h3 class="product-name" onclick="shop.openProductDetail(${product.id})">${product.name}</h3>
                        
                        <div class="product-rating">
                            ${starsHtml}
                            <span>(${product.reviews_count})</span>
                        </div>
                        
                        <div class="product-price-row">
                            <div class="price-container">
                                ${product.discount_pct > 0 ? `<span class="original-price">₹${product.price.toFixed(2)}</span>` : ''}
                                <span class="discounted-price">₹${finalPrice.toFixed(2)}</span>
                            </div>
                            
                            ${product.stock > 0 ? `
                                <button class="btn-add-cart-icon" onclick="shop.quickAdd(${product.id})" title="Add to Basket">
                                    <i class="fa-solid fa-cart-plus"></i>
                                </button>
                            ` : `
                                <span class="out-of-stock-text">Out of Stock</span>
                            `}
                        </div>
                        
                        <!-- Amazon Prime Delivery Tag -->
                        <div class="prime-delivery-tag">
                            <i class="fa-solid fa-truck-fast"></i> FREE Delivery
                        </div>
                        
                        <!-- Pan-India Upgrades -->
                        <div class="product-card-meta-upgrades">
                            <div class="pincode-checker-container">
                                <div class="pincode-input-group">
                                    <input type="text" class="pincode-input" id="pincode-input-${product.id}" placeholder="Enter Pincode" maxlength="6">
                                    <button class="pincode-btn" onclick="app.checkPincode(${product.id})">Check</button>
                                </div>
                                <div class="pincode-feedback" id="pincode-feedback-${product.id}"></div>
                            </div>
                            <span class="health-benefits-badge" onclick="app.openHealthModal('${product.material}')">
                                <i class="fa-solid fa-heart-pulse"></i> Health Benefits
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async quickAdd(productId) {
        const prod = this.products.find(p => p.id === productId);
        if (!prod) return;
        
        const defaultSize = prod.sizes ? prod.sizes.split(',')[0].trim() : "Standard";
        cart.add(prod, defaultSize);
    },

    async openProductDetail(productId) {
        try {
            const prod = await api.getProduct(productId);
            const detailModal = document.getElementById('product-detail-modal');
            const layout = document.getElementById('product-detail-layout');
            
            if (!detailModal || !layout) return;

            const finalPrice = prod.price * (1 - prod.discount_pct / 100);
            const sizeList = prod.sizes ? prod.sizes.split(',').map(s => s.trim()) : ["Standard"];
            
            let stockBadge = "";
            if (prod.stock <= 0) {
                stockBadge = `<span class="detail-stock-status out-of-stock">Out of Stock</span>`;
            } else if (prod.stock <= 5) {
                stockBadge = `<span class="detail-stock-status low-stock">Low Stock (Only ${prod.stock} Left)</span>`;
            } else {
                stockBadge = `<span class="detail-stock-status in-stock">In Stock (${prod.stock} Available)</span>`;
            }

            layout.innerHTML = `
                <div class="detail-image-box">
                    <img src="${prod.image_url}" alt="${prod.name}" onerror="this.src='https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop'">
                </div>
                <div class="detail-info-box">
                    <h2>${prod.name}</h2>
                    
                    <div class="detail-meta-tags">
                        <span class="detail-badge">${prod.category}</span>
                        <span class="detail-badge material">${prod.material}</span>
                        ${stockBadge}
                    </div>

                    <p class="detail-desc">${prod.description}</p>
                    
                    <div class="detail-pricing">
                        ${prod.discount_pct > 0 ? `
                            <span class="original-price" style="font-size: 14px; text-decoration: line-through; color: var(--text-muted); display: block;">MRP: ₹${prod.price.toFixed(2)}</span>
                        ` : ''}
                        <span style="font-size: 26px; font-weight: 800; color: var(--accent-copper);">₹${finalPrice.toFixed(2)}</span>
                        ${prod.discount_pct > 0 ? `
                            <span style="background-color: var(--accent-copper); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-left: 10px;">${prod.discount_pct}% OFF</span>
                        ` : ''}
                    </div>

                    <div class="detail-size-selector">
                        <h4>Select Size / Variant:</h4>
                        <div class="size-pill-container">
                            ${sizeList.map((size, idx) => `
                                <div class="size-pill ${idx === 0 ? 'selected' : ''}" onclick="shop.selectSize(this, '${size}')">${size}</div>
                            `).join('')}
                        </div>
                        <input type="hidden" id="selected-detail-size" value="${sizeList[0]}">
                    </div>

                    <div class="detail-add-row" style="display: flex; flex-direction: column; gap: 10px;">
                        ${prod.stock > 0 ? `
                            <button class="btn btn-primary" onclick="shop.addDetailCart(${prod.id})">
                                Add to Basket <i class="fa-solid fa-basket-shopping"></i>
                            </button>
                        ` : `
                            <button class="btn btn-secondary" disabled style="opacity: 0.5; cursor: not-allowed;">
                                Out of Stock
                            </button>
                        `}
                        
                        <button class="btn-whatsapp-share" onclick="shop.shareProductOnWhatsApp(${prod.id}, '${prod.name}')">
                            <i class="fa-brands fa-whatsapp"></i> Share on WhatsApp (Get 5% OFF)
                        </button>
                    </div>
                </div>
                
                <div class="detail-reviews-divider">
                    <h3 style="border-bottom: 2px solid var(--border-color); padding-bottom: 8px; margin-bottom: 15px;">
                        Customer Reviews & Ratings
                    </h3>
                    <div class="reviews-grid-layout">
                        <div class="reviews-list-container" id="product-reviews-feed">
                            <p style="color: var(--text-muted); font-size: 13px;">Loading feedback...</p>
                        </div>
                        
                        <div class="review-form-box" id="product-review-form-container">
                            <!-- Populated based on user authentication -->
                        </div>
                    </div>
                </div>
            `;

            detailModal.classList.add('open');
            await this.loadReviews(productId);
            this.renderReviewForm(productId);
        } catch (err) {
            app.showToast("Failed to load product specifications.", "error");
        }
    },

    selectSize(element, sizeValue) {
        const container = element.parentElement;
        container.querySelectorAll('.size-pill').forEach(pill => {
            pill.classList.remove('selected');
        });
        element.classList.add('selected');
        document.getElementById('selected-detail-size').value = sizeValue;
    },

    async addDetailCart(productId) {
        const prod = this.products.find(p => p.id === productId);
        const size = document.getElementById('selected-detail-size').value;
        if (prod) {
            cart.add(prod, size);
            app.toggleDetailModal(false);
        }
    },

    // --- Search suggestions matcher ---
    showSearchSuggestions(query) {
        const suggestionsBox = document.getElementById('search-suggestions');
        if (!suggestionsBox) return;

        const val = query.trim().toLowerCase();
        if (!val) {
            suggestionsBox.classList.remove('open');
            return;
        }

        // Search matching products
        const matches = this.products.filter(p => 
            p.name.toLowerCase().includes(val) || 
            p.category.toLowerCase().includes(val) ||
            p.material.toLowerCase().includes(val)
        ).slice(0, 5); // limit to 5 matches

        if (matches.length === 0) {
            suggestionsBox.classList.remove('open');
            return;
        }

        suggestionsBox.innerHTML = matches.map(prod => `
            <div class="suggestion-item" onclick="shop.openProductDetailFromSuggestion(${prod.id})">
                <span><i class="fa-solid fa-magnifying-glass" style="margin-right:10px; color:var(--text-muted);"></i> ${prod.name}</span>
                <span class="cat">${prod.category}</span>
            </div>
        `).join('');
        
        suggestionsBox.classList.add('open');
    },

    openProductDetailFromSuggestion(productId) {
        const suggestionsBox = document.getElementById('search-suggestions');
        if (suggestionsBox) suggestionsBox.classList.remove('open');
        this.openProductDetail(productId);
    },

    // --- Reviews rendering handlers ---
    async loadReviews(productId) {
        const container = document.getElementById('product-reviews-feed');
        if (!container) return;

        try {
            const reviews = await api.getReviews(productId);
            
            if (reviews.length === 0) {
                container.innerHTML = `<p style="color: var(--text-muted); font-size: 13px; padding: 20px 0;">No reviews listed yet. Be the first to review this utensil!</p>`;
                return;
            }

            container.innerHTML = reviews.map(r => {
                let ratingStars = "";
                for (let i = 1; i <= 5; i++) {
                    ratingStars += i <= r.rating ? `<i class="fa-solid fa-star"></i>` : `<i class="fa-regular fa-star"></i>`;
                }

                const dateStr = new Date(r.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });

                return `
                    <div class="review-item-card">
                        <div class="review-item-header">
                            <span class="review-item-name">${r.name}</span>
                            <span class="review-item-stars">${ratingStars}</span>
                        </div>
                        <p class="review-item-comment">${r.comment}</p>
                        <div class="review-item-date">${dateStr}</div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            container.innerHTML = `<p style="color: #d32f2f; font-size: 13px;">Failed to retrieve feedback.</p>`;
        }
    },

    renderReviewForm(productId) {
        const container = document.getElementById('product-review-form-container');
        if (!container) return;

        const currentUser = api.getUser();

        if (!currentUser) {
            container.innerHTML = `
                <div style="text-align: center; padding: 15px 0;">
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Only logged in customers can write reviews.</p>
                    <button class="btn btn-secondary" onclick="app.toggleDetailModal(false); app.toggleAuthModal(true);" style="font-size: 12px; padding: 6px 12px;">Login Now</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <h4>Write a Review</h4>
            <form id="submit-review-form" onsubmit="shop.handleReviewSubmit(event, ${productId})">
                <div class="form-group" style="margin-bottom: 10px;">
                    <label>Your Rating</label>
                    <div class="rating-stars-input" id="rating-stars-picker">
                        <i class="fa-regular fa-star active" data-rating="1" onclick="shop.pickReviewStars(1)"></i>
                        <i class="fa-regular fa-star" data-rating="2" onclick="shop.pickReviewStars(2)"></i>
                        <i class="fa-regular fa-star" data-rating="3" onclick="shop.pickReviewStars(3)"></i>
                        <i class="fa-regular fa-star" data-rating="4" onclick="shop.pickReviewStars(4)"></i>
                        <i class="fa-regular fa-star" data-rating="5" onclick="shop.pickReviewStars(5)"></i>
                    </div>
                    <input type="hidden" id="review-selected-rating" value="1">
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label>Review Description</label>
                    <textarea id="review-comment-input" rows="3" placeholder="Share your experience cooking with this utensil..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="font-size: 13px; padding: 8px;">
                    Submit Feedback
                </button>
            </form>
        `;
    },

    pickReviewStars(rating) {
        const picker = document.getElementById('rating-stars-picker');
        if (!picker) return;

        picker.querySelectorAll('i').forEach(star => {
            const starVal = parseInt(star.getAttribute('data-rating'));
            if (starVal <= rating) {
                star.className = "fa-solid fa-star active";
            } else {
                star.className = "fa-regular fa-star";
            }
        });
        document.getElementById('review-selected-rating').value = rating;
    },

    async handleReviewSubmit(e, productId) {
        e.preventDefault();
        
        const currentUser = api.getUser();
        const rating = parseInt(document.getElementById('review-selected-rating').value);
        const comment = document.getElementById('review-comment-input').value;

        const payload = {
            product_id: productId,
            name: currentUser ? currentUser.name : "Customer",
            rating,
            comment
        };

        try {
            await api.submitReview(payload);
            app.showToast("Review submitted successfully!", "success");
            
            await this.loadReviews(productId);
            await this.loadProducts();
            this.renderReviewForm(productId);
        } catch (err) {
            app.showToast("Failed to post feedback.", "error");
        }
    },

    shareProductOnWhatsApp(productId, productName) {
        const shareText = `Check out this beautiful pure hand-crafted ${productName} from Ramdev Store! https://ramdev-super-store.onrender.com`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');

        // Simulate returning to the page and apply the discount
        setTimeout(() => {
            if (typeof cart !== 'undefined' && typeof cart.applyShareCoupon === 'function') {
                cart.applyShareCoupon();
            }
        }, 3000);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    shop.init();
});
