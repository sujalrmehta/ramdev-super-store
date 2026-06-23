// server.js - Custom Web and API Server for Ramdev Super Store (Zero Dependencies)
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const PORT = process.env.PORT || 5173;
const PUBLIC_DIR = path.join(__dirname, 'public');

const ACTIVE_SESSIONS = {}; // token -> user_id

class Router {
    constructor() {
        this.routes = [];
    }

    add(method, pathTemplate, handler) {
        const paramNames = [];
        const regexPath = pathTemplate
            .replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
                paramNames.push(key);
                return '([^/]+)';
            })
            .replace(/\//g, '\\/');
        
        this.routes.push({
            method,
            regex: new RegExp(`^${regexPath}$`),
            paramNames,
            handler
        });
    }

    get(path, handler) { this.add('GET', path, handler); }
    post(path, handler) { this.add('POST', path, handler); }
    put(path, handler) { this.add('PUT', path, handler); }
    delete(path, handler) { this.add('DELETE', path, handler); }

    match(method, pathname) {
        for (const route of this.routes) {
            if (route.method !== method) continue;
            const match = pathname.match(route.regex);
            if (match) {
                const params = {};
                route.paramNames.forEach((name, i) => {
                    params[name] = match[i + 1];
                });
                return { handler: route.handler, params };
            }
        }
        return null;
    }
}

const router = new Router();

// --- Helper Utilities ---
function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

async function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                resolve({});
            }
        });
    });
}

function authenticate(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '').trim();
    const userId = ACTIVE_SESSIONS[token];
    if (!userId) return null;
    return db.getUserById(userId);
}

// --- API Router Endpoints ---

// User Registration
router.post('/api/auth/register', async (req, res) => {
    const body = await parseBody(req);
    const { name, email, password } = body;
    if (!name || !email || !password) {
        return sendJSON(res, 400, { error: "Name, email and password are required." });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
        return sendJSON(res, 400, { error: "Email is already registered." });
    }

    const newUser = db.createUser({ name, email, password, role: 'customer' });
    const token = crypto.randomBytes(32).toString('hex');
    ACTIVE_SESSIONS[token] = newUser.id;

    const { password: _, ...userWithoutPassword } = newUser;
    sendJSON(res, 201, { user: userWithoutPassword, token });
});

// User Login
router.post('/api/auth/login', async (req, res) => {
    const body = await parseBody(req);
    const { email, password } = body;
    if (!email || !password) {
        return sendJSON(res, 400, { error: "Email and password are required." });
    }

    const user = db.getUserByEmail(email);
    if (!user || !db.verifyUserPassword(user, password)) {
        return sendJSON(res, 401, { error: "Invalid email or password." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    ACTIVE_SESSIONS[token] = user.id;

    const { password: _, ...userWithoutPassword } = user;
    sendJSON(res, 200, { user: userWithoutPassword, token });
});

// Get User Profile
router.get('/api/auth/profile', async (req, res) => {
    const user = authenticate(req);
    if (!user) return sendJSON(res, 401, { error: "Unauthorized" });
    const { password: _, ...userWithoutPassword } = user;
    sendJSON(res, 200, userWithoutPassword);
});

// Get Products
router.get('/api/products', async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filters = {
        search: url.searchParams.get('search'),
        category: url.searchParams.get('category'),
        material: url.searchParams.get('material'),
        maxPrice: url.searchParams.get('maxPrice'),
        sortBy: url.searchParams.get('sortBy')
    };

    const products = db.getProducts(filters);
    sendJSON(res, 200, products);
});

// Get Product by ID
router.get('/api/products/:id', async (req, res, params) => {
    const product = db.getProductById(params.id);
    if (!product) {
        return sendJSON(res, 404, { error: "Utensil not found." });
    }
    sendJSON(res, 200, product);
});

// Create Product (Admin Only)
router.post('/api/products', async (req, res) => {
    const user = authenticate(req);
    if (!user || user.role !== 'admin') {
        return sendJSON(res, 403, { error: "Forbidden. Admin access required." });
    }

    const body = await parseBody(req);
    if (!body.name || !body.price || !body.stock) {
        return sendJSON(res, 400, { error: "Name, price and stock are required." });
    }

    const newProduct = db.createProduct(body);
    sendJSON(res, 201, newProduct);
});

// Update Product (Admin Only)
router.put('/api/products/:id', async (req, res, params) => {
    const user = authenticate(req);
    if (!user || user.role !== 'admin') {
        return sendJSON(res, 403, { error: "Forbidden. Admin access required." });
    }

    const body = await parseBody(req);
    const updated = db.updateProduct(params.id, body);
    if (!updated) {
        return sendJSON(res, 404, { error: "Utensil not found." });
    }
    sendJSON(res, 200, updated);
});

// Delete Product (Admin Only)
router.delete('/api/products/:id', async (req, res, params) => {
    const user = authenticate(req);
    if (!user || user.role !== 'admin') {
        return sendJSON(res, 403, { error: "Forbidden. Admin access required." });
    }

    const deleted = db.deleteProduct(params.id);
    if (!deleted) {
        return sendJSON(res, 404, { error: "Utensil not found." });
    }
    sendJSON(res, 200, { success: true });
});

// Get Product Reviews
router.get('/api/products/:id/reviews', async (req, res, params) => {
    const reviews = db.getReviews(params.id);
    sendJSON(res, 200, reviews);
});

// Create Product Review
router.post('/api/reviews', async (req, res) => {
    const body = await parseBody(req);
    const { product_id, name, rating, comment } = body;
    if (!product_id || !rating) {
        return sendJSON(res, 400, { error: "Product ID and rating are required." });
    }

    const review = db.createReview(product_id, { name, rating, comment });
    sendJSON(res, 201, review);
});

// Apply Coupon Code
router.post('/api/coupons/apply', async (req, res) => {
    const body = await parseBody(req);
    const { code } = body;
    if (!code) {
        return sendJSON(res, 400, { error: "Coupon code is required." });
    }

    const coupon = db.validateCoupon(code);
    if (!coupon) {
        return sendJSON(res, 400, { error: "Invalid or expired coupon code." });
    }
    sendJSON(res, 200, coupon);
});

// Checkout Cart (supports coupon applying)
router.post('/api/checkout', async (req, res) => {
    const user = authenticate(req);
    if (!user) return sendJSON(res, 401, { error: "Unauthorized. Please login to checkout." });

    const body = await parseBody(req);
    const { shippingInfo, items, coupon_code } = body;
    if (!shippingInfo || !shippingInfo.name || !shippingInfo.address || !items || !items.length) {
        return sendJSON(res, 400, { error: "Shipping details and cart items are required." });
    }

    try {
        const order = db.createOrder(user.id, shippingInfo, items, coupon_code || "");
        sendJSON(res, 201, order);
    } catch (err) {
        sendJSON(res, 400, { error: err.message });
    }
});

// Get Orders List
router.get('/api/orders', async (req, res) => {
    const user = authenticate(req);
    if (!user) return sendJSON(res, 401, { error: "Unauthorized" });

    const userId = user.role === 'admin' ? null : user.id;
    const orders = db.getOrders(userId);
    sendJSON(res, 200, orders);
});

// Get Admin stats
router.get('/api/admin/stats', async (req, res) => {
    const user = authenticate(req);
    if (!user || user.role !== 'admin') {
        return sendJSON(res, 403, { error: "Forbidden. Admin access required." });
    }

    const dbStats = db.getStats();
    const memoryUsage = process.memoryUsage();

    const systemStats = {
        ...dbStats,
        system: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: Math.round(process.uptime()),
            memoryUsage: {
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
            }
        }
    };

    sendJSON(res, 200, systemStats);
});


// --- Static File Serving ---
async function serveStaticFile(pathname, res) {
    let safePath = pathname === '/' ? 'index.html' : pathname;
    let filePath = path.join(PUBLIC_DIR, safePath);

    console.log(`[Static Request] pathname: ${pathname} -> filePath: ${filePath}`);

    if (!filePath.startsWith(PUBLIC_DIR)) {
        console.warn(`[Static Access Denied] filePath: ${filePath} does not start with PUBLIC_DIR: ${PUBLIC_DIR}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access Denied');
        return;
    }

    try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        const mimeTypes = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (err) {
        console.error(`[Static File Error] filePath: ${filePath} error: ${err.message}`);
        try {
            const indexHtml = await fs.readFile(path.join(PUBLIC_DIR, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexHtml);
        } catch (subErr) {
            console.error(`[Static Fallback Error] error: ${subErr.message}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 File Not Found');
        }
    }
}

// --- Main Request Handler ---
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Security & Data Privacy Protection Headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Content-Security-Policy', "default-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:;");

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    const match = router.match(req.method, pathname);

    if (match) {
        try {
            await match.handler(req, res, match.params);
        } catch (err) {
            console.error(`Error handling ${req.method} ${pathname}:`, err);
            sendJSON(res, 500, { error: 'Internal Server Error' });
        }
    } else {
        await serveStaticFile(pathname, res);
    }
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`   Ramdev Super Store Server Running on http://localhost:${PORT}`);
    console.log(`   Running via: ${process.argv[0]}`);
    console.log(`=======================================================`);
});
