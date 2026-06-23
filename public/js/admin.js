// admin.js - Admin Dashboard Inventory & Sales Controller
const admin = {
    stats: {},
    chartInstance: null,

    async init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const form = document.getElementById('admin-product-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit();
            });
        }

        const addBtn = document.getElementById('btn-admin-add-product');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openAddModal();
            });
        }
    },

    async loadDashboard() {
        try {
            const data = await api.getAdminStats();
            this.stats = data;
            this.renderStats();
            this.renderInventory();
            await this.loadOrdersLog();
            this.renderChart();
        } catch (err) {
            app.showToast("Failed to fetch administrative metrics.", "error");
        }
    },

    renderStats() {
        const rev = document.getElementById('admin-revenue');
        const count = document.getElementById('admin-orders-count');
        const alert = document.getElementById('admin-alerts-count');
        const ram = document.getElementById('admin-memory-usage');

        if (rev) rev.innerText = this.stats.revenue.toFixed(2);
        if (count) count.innerText = this.stats.ordersCount;
        if (alert) alert.innerText = this.stats.inventoryAlerts;
        if (ram && this.stats.system) {
            ram.innerText = `${this.stats.system.memoryUsage.heapUsed} MB`;
        }
    },

    // --- Upgraded Chart.js Dashboard implementation ---
    renderChart() {
        const ctxEl = document.getElementById('admin-revenue-chart');
        if (!ctxEl) return;

        const ctx = ctxEl.getContext('2d');
        if (this.chartInstance) {
            this.chartInstance.destroy(); // Clear previous instance before redraw
        }

        const isDark = document.body.classList.contains('dark-mode');
        const textColor = isDark ? '#e0d8d5' : '#3e2723';
        const gridColor = isDark ? '#322927' : '#efebe9';

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.stats.graph.labels,
                datasets: [{
                    label: 'Sales Revenue (₹)',
                    data: this.stats.graph.data,
                    borderColor: '#d84315', // accent-copper
                    backgroundColor: 'rgba(216, 67, 21, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#cca43b', // accent-gold
                    pointBorderColor: '#d84315',
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { family: 'Outfit', size: 13, weight: '600' }
                        }
                    },
                    tooltip: {
                        titleFont: { family: 'Outfit' },
                        bodyFont: { family: 'Inter' }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    },

    async loadOrdersLog() {
        try {
            const orders = await api.getOrders();
            const container = document.getElementById('admin-orders-list');
            if (!container) return;

            if (orders.length === 0) {
                container.innerHTML = `<p style="padding: 20px; color: var(--text-muted); font-size: 13px;">No orders logged yet.</p>`;
                return;
            }

            container.innerHTML = orders.map(order => {
                const dateStr = new Date(order.order_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return `
                    <div class="inventory-item">
                        <div>
                            <div style="font-weight: 700; font-size: 13px;">${order.id} - ₹${order.total_amount.toFixed(2)}</div>
                            <div class="inventory-item-meta">User ID: ${order.user_id} | Name: ${order.shipping_name}</div>
                            <div class="inventory-item-meta" style="font-size: 10px; color: var(--text-muted);">${dateStr}</div>
                        </div>
                        <span style="font-size: 11px; font-weight: 700; color: ${order.status === 'Delivered' ? 'var(--accent-green)' : 'var(--accent-copper)'};">
                            ${order.status}
                        </span>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error(err);
        }
    },

    renderInventory() {
        const container = document.getElementById('admin-inventory-list');
        if (!container) return;

        const productsList = shop.products;

        if (productsList.length === 0) {
            container.innerHTML = `<p style="padding: 20px; color: var(--text-muted); font-size: 13px;">No items in inventory.</p>`;
            return;
        }

        container.innerHTML = productsList.map(prod => `
            <div class="inventory-item">
                <div>
                    <div class="inventory-item-title" title="${prod.name}">${prod.name}</div>
                    <div class="inventory-item-meta">
                        ₹${prod.price.toFixed(2)} | Material: ${prod.material} | Stock: 
                        <span style="font-weight: 700; color: ${prod.stock === 0 ? '#d32f2f' : (prod.stock <= 5 ? '#e65f2b' : 'inherit')}">
                            ${prod.stock}
                        </span>
                    </div>
                </div>
                <div class="inventory-actions">
                    <button class="btn-icon edit" onclick="admin.openEditModal(${prod.id})" title="Edit Utensil">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon delete" onclick="admin.deleteProduct(${prod.id})" title="Delete Utensil">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    openAddModal() {
        document.getElementById('admin-product-modal-title').innerText = "Add New Utensil";
        document.getElementById('admin-product-form').reset();
        document.getElementById('admin-prod-id').value = "";
        
        app.toggleAdminProductModal(true);
    },

    async openEditModal(productId) {
        try {
            const prod = await api.getProduct(productId);
            if (!prod) return;

            document.getElementById('admin-product-modal-title').innerText = "Edit Utensil";
            document.getElementById('admin-prod-id').value = prod.id;
            document.getElementById('admin-prod-name').value = prod.name;
            document.getElementById('admin-prod-category').value = prod.category;
            document.getElementById('admin-prod-material').value = prod.material;
            document.getElementById('admin-prod-price').value = prod.price;
            document.getElementById('admin-prod-discount').value = prod.discount_pct;
            document.getElementById('admin-prod-stock').value = prod.stock;
            document.getElementById('admin-prod-sizes').value = prod.sizes || "";
            document.getElementById('admin-prod-image').value = prod.image_url || "";
            document.getElementById('admin-prod-desc').value = prod.description || "";

            app.toggleAdminProductModal(true);
        } catch (err) {
            app.showToast("Failed to fetch product details.", "error");
        }
    },

    async deleteProduct(productId) {
        if (!confirm("Are you sure you want to delete this utensil from inventory?")) return;

        try {
            await api.deleteProduct(productId);
            app.showToast("Product deleted successfully.", "success");
            await shop.loadProducts(); 
            await this.loadDashboard(); 
        } catch (err) {
            app.showToast("Failed to delete utensil.", "error");
        }
    },

    async handleFormSubmit() {
        const id = document.getElementById('admin-prod-id').value;
        const pData = {
            name: document.getElementById('admin-prod-name').value,
            category: document.getElementById('admin-prod-category').value,
            material: document.getElementById('admin-prod-material').value,
            price: parseFloat(document.getElementById('admin-prod-price').value),
            discount_pct: parseInt(document.getElementById('admin-prod-discount').value) || 0,
            stock: parseInt(document.getElementById('admin-prod-stock').value),
            sizes: document.getElementById('admin-prod-sizes').value,
            image_url: document.getElementById('admin-prod-image').value,
            description: document.getElementById('admin-prod-desc').value
        };

        try {
            if (id) {
                await api.updateProduct(id, pData);
                app.showToast("Utensil updated successfully.", "success");
            } else {
                await api.createProduct(pData);
                app.showToast("New Utensil listed successfully.", "success");
            }

            app.toggleAdminProductModal(false);
            await shop.loadProducts(); 
            await this.loadDashboard(); 
        } catch (err) {
            app.showToast("Failed to save product details.", "error");
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    admin.init();
});
