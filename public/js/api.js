// api.js - API Client Client-Side Service
const API_BASE = ""; 

const api = {
    getToken() {
        return localStorage.getItem('ramdev_auth_token');
    },

    setToken(token) {
        if (token) {
            localStorage.setItem('ramdev_auth_token', token);
        } else {
            localStorage.removeItem('ramdev_auth_token');
        }
    },

    getUser() {
        const userStr = localStorage.getItem('ramdev_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser(user) {
        if (user) {
            localStorage.setItem('ramdev_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('ramdev_user');
        }
    },

    async request(method, endpoint, body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, options);
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Network error occurred.');
            }
            return data;
        } catch (err) {
            console.error(`API Error on ${method} ${endpoint}:`, err);
            throw err;
        }
    },

    // --- Authentication API ---
    async login(email, password) {
        const res = await this.request('POST', '/api/auth/login', { email, password });
        this.setToken(res.token);
        this.setUser(res.user);
        return res.user;
    },

    async register(name, email, password) {
        const res = await this.request('POST', '/api/auth/register', { name, email, password });
        this.setToken(res.token);
        this.setUser(res.user);
        return res.user;
    },

    logout() {
        this.setToken(null);
        this.setUser(null);
    },

    async getProfile() {
        try {
            return await this.request('GET', '/api/auth/profile');
        } catch (err) {
            this.logout();
            throw err;
        }
    },

    // --- Products API ---
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.material) params.append('material', filters.material);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const queryString = params.toString();
        const url = `/api/products${queryString ? '?' + queryString : ''}`;
        return await this.request('GET', url);
    },

    async getProduct(id) {
        return await this.request('GET', `/api/products/${id}`);
    },

    async createProduct(pData) {
        return await this.request('POST', '/api/products', pData);
    },

    async updateProduct(id, pData) {
        return await this.request('PUT', `/api/products/${id}`, pData);
    },

    async deleteProduct(id) {
        return await this.request('DELETE', `/api/products/${id}`);
    },

    // --- Reviews API ---
    async getReviews(productId) {
        return await this.request('GET', `/api/products/${productId}/reviews`);
    },

    async submitReview(rData) {
        return await this.request('POST', '/api/reviews', rData);
    },

    // --- Coupons API ---
    async applyCoupon(code) {
        return await this.request('POST', '/api/coupons/apply', { code });
    },

    async chatMessage(message) {
        return await this.request('POST', '/api/chat', { message });
    },

    // --- Checkout & Orders API ---
    async checkout(shippingInfo, items, couponCode = "") {
        return await this.request('POST', '/api/checkout', { shippingInfo, items, coupon_code: couponCode });
    },

    async getOrders() {
        return await this.request('GET', '/api/orders');
    },

    // --- Admin Stats API ---
    async getAdminStats() {
        return await this.request('GET', '/api/admin/stats');
    }
};
