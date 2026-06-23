// db.js - Relational Mock SQL Database Controller for Ramdev Super Store
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, 'db');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const ORDER_ITEMS_FILE = path.join(DB_DIR, 'order_items.json');
const REVIEWS_FILE = path.join(DB_DIR, 'reviews.json');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    if (!storedPassword || !storedPassword.includes(':')) {
        return password === storedPassword;
    }
    const [salt, originalHash] = storedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
}

// Ensure Database directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial Seed Data for Cookware & Utensils
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "Royal Golden Brass Dinner Thali Set",
        description: "Handcrafted traditional brass dinner set containing 1 large Thali plate, 3 bowls (katori), 1 sweet dish plate, 1 glass, and 1 spoon. Ideal for festive dining and Ayurvedic health benefits.",
        price: 2499.00,
        discount_pct: 10,
        stock: 15,
        image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Dinnerware",
        material: "Brass",
        sizes: "Standard",
        rating: 4.8,
        reviews_count: 24
    },
    {
        id: 2,
        name: "Pure Hammered Copper Water Jug & Glasses Set",
        description: "Premium quality copper jug (1.5L) with 2 matching drinking glasses. Ayurvedic practices recommend storing water overnight in copper vessels for improved digestion and immunity.",
        price: 1299.00,
        discount_pct: 15,
        stock: 35,
        image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Serveware",
        material: "Copper",
        sizes: "1.5 Litre Jug",
        rating: 4.6,
        reviews_count: 42
    },
    {
        id: 3,
        name: "Heavy Duty Cast Iron Kadhai (Deep Wok)",
        description: "Pre-seasoned organic cast iron kadhai with dual loop helper handles. Delivers superior heat retention and infuses food with dietary iron. Perfect for deep frying and slow cooking.",
        price: 1599.00,
        discount_pct: 20,
        stock: 5,
        image_url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Cookware",
        material: "Cast Iron",
        sizes: "2.5 Litre, 4 Litre",
        rating: 4.7,
        reviews_count: 88
    },
    {
        id: 4,
        name: "Tri-Ply Stainless Steel Pressure Cooker",
        description: "Outer layer induction-compatible stainless steel, middle layer fast-heating aluminum, inner layer surgical steel. Safe, whistling regulator, ergonomic handle.",
        price: 2199.00,
        discount_pct: 5,
        stock: 22,
        image_url: "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Cookware",
        material: "Stainless Steel",
        sizes: "3 Litre, 5 Litre",
        rating: 4.5,
        reviews_count: 110
    },
    {
        id: 5,
        name: "Hammered Copper Bottom Handi Cook & Serve Set",
        description: "Set of 3 stainless steel handi bowls with authentic copper bottoms and glass lids. Sleek nested design for compact storage and decorative tabletop presentation.",
        price: 1149.00,
        discount_pct: 25,
        stock: 40,
        image_url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Cookware",
        material: "Copper",
        sizes: "Small/Medium/Large Set",
        rating: 4.3,
        reviews_count: 31
    },
    {
        id: 6,
        name: "Professional Chef's Kitchen Knife Set",
        description: "Carbon-tempered German stainless steel blades. Set includes 8-inch Chef knife, utility knife, paring knife, and heavy duty kitchen shears. Full tang pakkawood handles.",
        price: 899.00,
        discount_pct: 12,
        stock: 18,
        image_url: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Cutlery",
        material: "Stainless Steel",
        sizes: "Set of 4",
        rating: 4.4,
        reviews_count: 19
    },
    {
        id: 7,
        name: "Handcrafted Neem Wood Spatulas & Ladles",
        description: "Non-stick friendly organic neem wood spoons. Anti-bacterial properties, heat-resistant, scratch-free cookware protection. Set of 5 different utility spatulas.",
        price: 349.00,
        discount_pct: 0,
        stock: 60,
        image_url: "https://images.unsplash.com/photo-1581683705068-ca8f49fc7f45?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1581683705068-ca8f49fc7f45?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Accessories",
        material: "Wood",
        sizes: "Set of 5",
        rating: 4.2,
        reviews_count: 55
    },
    {
        id: 8,
        name: "Handmade Terracotta Clay Handi with Lid",
        description: "100% organic, unglazed clay cooking pot. Retains food moisture and alkaline properties. Simulates slow earthen charcoal flavor for authentic daal and curries.",
        price: 499.00,
        discount_pct: 15,
        stock: 12,
        image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Cookware",
        material: "Clay",
        sizes: "2 Litre",
        rating: 4.1,
        reviews_count: 14
    },
    {
        id: 9,
        name: "Designer Ceramic Soup Bowl Set",
        description: "Elegant stoneware soup bowls with integrated handle notches and wooden soup spoons. Vibrant microwave and dishwasher safe glaze finishes. Set of 4.",
        price: 799.00,
        discount_pct: 8,
        stock: 25,
        image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Dinnerware",
        material: "Ceramic",
        sizes: "Set of 4",
        rating: 4.6,
        reviews_count: 22
    },
    {
        id: 10,
        name: "Stainless Steel 3-Tier Office Lunch Box",
        description: "Leak-proof clip-locking lunch carrier with double-wall thermal insulation. Heavy duty steel rings and compact carrying handle. Keeps meals warm for 4-6 hours.",
        price: 649.00,
        discount_pct: 10,
        stock: 0,
        image_url: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596797882943-1911744b4104?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Accessories",
        material: "Stainless Steel",
        sizes: "3-Tier",
        rating: 4.3,
        reviews_count: 73
    }
];

const INITIAL_USERS = [
    {
        id: 1,
        name: "Rakesh Kumar",
        email: "rakeshcmehta2107@gmail.com",
        password: "rakesh@2107",
        role: "admin",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        name: "Rahul Kumar",
        email: "customer@ramdev.com",
        password: "pass123",
        role: "customer",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const INITIAL_ORDERS = [
    {
        id: "ORD-92813",
        user_id: 2,
        order_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        total_amount: 3798.00,
        status: "Delivered",
        shipping_name: "Rahul Kumar",
        shipping_address: "Flat 402, Green Glen Layout, Bellandur, Bangalore, Karnataka - 560103",
        payment_method: "Cash on Delivery",
        discount_amount: 0.00,
        coupon_code: ""
    },
    {
        id: "ORD-48291",
        user_id: 2,
        order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        total_amount: 1104.15,
        status: "Processing",
        shipping_name: "Rahul Kumar",
        shipping_address: "Flat 402, Green Glen Layout, Bellandur, Bangalore, Karnataka - 560103",
        payment_method: "Credit Card",
        discount_amount: 0.00,
        coupon_code: ""
    }
];

const INITIAL_ORDER_ITEMS = [
    { id: 1, order_id: "ORD-92813", product_id: 1, size: "Standard", quantity: 1, price: 2249.10 },
    { id: 2, order_id: "ORD-92813", product_id: 3, size: "2.5 Litre", quantity: 1, price: 1279.20 },
    { id: 3, order_id: "ORD-92813", product_id: 7, size: "Set of 5", quantity: 1, price: 349.00 },
    { id: 4, order_id: "ORD-48291", product_id: 2, size: "1.5 Litre Jug", quantity: 1, price: 1104.15 }
];

const INITIAL_REVIEWS = [
    {
        id: 1,
        product_id: 1,
        name: "Suresh Patel",
        rating: 5,
        comment: "Eating on this brass thali feels incredibly premium. It has a heavy, solid construction, and classic appearance.",
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        product_id: 1,
        name: "Ananya Iyer",
        rating: 4,
        comment: "Very elegant brass plate. Takes some care to clean (need pitambari or lemon), but beautiful ayurvedic addition to our dining table.",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 3,
        product_id: 2,
        name: "Vikram Malhotra",
        rating: 5,
        comment: "Excellent pure copper jug. Drinking stored copper water has solved my acidity. Strongly recommended!",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 4,
        product_id: 3,
        name: "Rajesh Sen",
        rating: 5,
        comment: "Authentic heavy cast iron wok. Cooked dry potato curry in it, it adds amazing taste and nutritional values.",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const PROMO_COUPONS = {
    "FESTIVE15": { code: "FESTIVE15", type: "percentage", value: 15, description: "15% Off on all utensils" },
    "BRONZE10": { code: "BRONZE10", type: "percentage", value: 10, description: "10% Off on select tableware" },
    "RAMDEV50": { code: "RAMDEV50", type: "flat", value: 50.00, description: "Flat ₹50 discount on your order" },
    "SHARE5": { code: "SHARE5", type: "percentage", value: 5, description: "WhatsApp Sharing Reward (5% OFF)" }
};

// Helper Functions
function readJSON(file, defaultVal = []) {
    try {
        if (!fs.existsSync(file)) {
            writeJSON(file, defaultVal);
            return defaultVal;
        }
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${file}:`, err);
        return defaultVal;
    }
}

function writeJSON(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error(`Error writing ${file}:`, err);
    }
}

// Database Initializer
function initDatabase() {
    if (!fs.existsSync(PRODUCTS_FILE) || readJSON(PRODUCTS_FILE).length === 0) {
        writeJSON(PRODUCTS_FILE, INITIAL_PRODUCTS);
        console.log("Seeded Products table.");
    }
    if (!fs.existsSync(USERS_FILE) || readJSON(USERS_FILE).length === 0) {
        const hashedUsers = INITIAL_USERS.map(u => ({
            ...u,
            password: hashPassword(u.password)
        }));
        writeJSON(USERS_FILE, hashedUsers);
        console.log("Seeded Users table.");
    }
    if (!fs.existsSync(ORDERS_FILE) || readJSON(ORDERS_FILE).length === 0) {
        writeJSON(ORDERS_FILE, INITIAL_ORDERS);
        console.log("Seeded Orders table.");
    }
    if (!fs.existsSync(ORDER_ITEMS_FILE) || readJSON(ORDER_ITEMS_FILE).length === 0) {
        writeJSON(ORDER_ITEMS_FILE, INITIAL_ORDER_ITEMS);
        console.log("Seeded Order Items table.");
    }
    if (!fs.existsSync(REVIEWS_FILE) || readJSON(REVIEWS_FILE).length === 0) {
        writeJSON(REVIEWS_FILE, INITIAL_REVIEWS);
        console.log("Seeded Reviews table.");
    }
    console.log("Database tables initialized successfully.");
}

const db = {
    init: initDatabase,

    // --- Users ---
    getUserByEmail(email) {
        const users = readJSON(USERS_FILE);
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    getUserById(id) {
        const users = readJSON(USERS_FILE);
        return users.find(u => u.id === parseInt(id));
    },

    createUser(userData) {
        const users = readJSON(USERS_FILE);
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: newId,
            name: userData.name,
            email: userData.email,
            password: hashPassword(userData.password),
            role: userData.role || 'customer',
            created_at: new Date().toISOString()
        };
        users.push(newUser);
        writeJSON(USERS_FILE, users);
        return newUser;
    },

    verifyUserPassword(user, password) {
        return verifyPassword(password, user.password);
    },

    // --- Products ---
    getProducts(filters = {}) {
        let products = readJSON(PRODUCTS_FILE);

        if (filters.search) {
            const query = filters.search.toLowerCase();
            
            // Map Hindi/transliterated terms to English product keywords for bilingual search
            const termMap = {
                'पीतल': 'brass',
                'peetal': 'brass',
                'तांबा': 'copper',
                'तांबे': 'copper',
                'tamba': 'copper',
                'tambha': 'copper',
                'लोहा': 'iron',
                'लोहे': 'iron',
                'loha': 'iron',
                'मिट्टी': 'clay',
                'mitti': 'clay',
                'कांस्य': 'bronze',
                'कंसा': 'bronze',
                'kansa': 'bronze',
                'स्टील': 'steel',
                'steel': 'steel',
                'चम्मच': 'spoon',
                'chamach': 'spoon',
                'थाली': 'thali',
                'thali': 'thali',
                'कड़ाही': 'kadhai',
                'kadahi': 'kadhai',
                'kadhai': 'kadhai',
                'तवा': 'tawa',
                'tawa': 'tawa',
                'कटोरी': 'bowl',
                'katori': 'bowl',
                'गिलास': 'glass',
                'glass': 'glass'
            };

            let queryTerms = [query];
            for (const [key, value] of Object.entries(termMap)) {
                if (query.includes(key)) {
                    queryTerms.push(value);
                }
            }

            products = products.filter(p => {
                const name = p.name.toLowerCase();
                const desc = p.description.toLowerCase();
                const mat = p.material ? p.material.toLowerCase() : '';
                const cat = p.category ? p.category.toLowerCase() : '';
                return queryTerms.some(term => 
                    name.includes(term) || 
                    desc.includes(term) || 
                    mat.includes(term) || 
                    cat.includes(term)
                );
            });
        }

        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }

        if (filters.material) {
            // Support comma separated strings
            const materials = filters.material.split(',').filter(Boolean);
            if (materials.length > 0) {
                products = products.filter(p => materials.includes(p.material));
            }
        }

        if (filters.maxPrice) {
            products = products.filter(p => (p.price * (1 - p.discount_pct/100)) <= parseFloat(filters.maxPrice));
        }

        // Sorting
        if (filters.sortBy) {
            if (filters.sortBy === 'priceAsc') {
                products.sort((a, b) => {
                    const priceA = a.price * (1 - a.discount_pct/100);
                    const priceB = b.price * (1 - b.discount_pct/100);
                    return priceA - priceB;
                });
            } else if (filters.sortBy === 'priceDesc') {
                products.sort((a, b) => {
                    const priceA = a.price * (1 - a.discount_pct/100);
                    const priceB = b.price * (1 - b.discount_pct/100);
                    return priceB - priceA;
                });
            } else if (filters.sortBy === 'rating') {
                products.sort((a, b) => b.rating - a.rating);
            }
        }

        return products;
    },

    getProductById(id) {
        const products = readJSON(PRODUCTS_FILE);
        return products.find(p => p.id === parseInt(id));
    },

    createProduct(pData) {
        const products = readJSON(PRODUCTS_FILE);
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name: pData.name,
            description: pData.description || "",
            price: parseFloat(pData.price),
            discount_pct: parseInt(pData.discount_pct) || 0,
            stock: parseInt(pData.stock) || 0,
            image_url: pData.image_url || "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop",
            category: pData.category || "Cookware",
            material: pData.material || "Stainless Steel",
            sizes: pData.sizes || "Standard",
            rating: 5.0,
            reviews_count: 0,
            created_at: new Date().toISOString()
        };
        products.push(newProduct);
        writeJSON(PRODUCTS_FILE, products);
        return newProduct;
    },

    updateProduct(id, pData) {
        const products = readJSON(PRODUCTS_FILE);
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index === -1) return null;

        products[index] = {
            ...products[index],
            name: pData.name ?? products[index].name,
            description: pData.description ?? products[index].description,
            price: pData.price !== undefined ? parseFloat(pData.price) : products[index].price,
            discount_pct: pData.discount_pct !== undefined ? parseInt(pData.discount_pct) : products[index].discount_pct,
            stock: pData.stock !== undefined ? parseInt(pData.stock) : products[index].stock,
            image_url: pData.image_url ?? products[index].image_url,
            category: pData.category ?? products[index].category,
            material: pData.material ?? products[index].material,
            sizes: pData.sizes ?? products[index].sizes
        };

        writeJSON(PRODUCTS_FILE, products);
        return products[index];
    },

    deleteProduct(id) {
        let products = readJSON(PRODUCTS_FILE);
        const exists = products.some(p => p.id === parseInt(id));
        if (!exists) return false;

        products = products.filter(p => p.id !== parseInt(id));
        writeJSON(PRODUCTS_FILE, products);
        return true;
    },

    // --- Reviews ---
    getReviews(productId) {
        const reviews = readJSON(REVIEWS_FILE);
        return reviews
            .filter(r => r.product_id === parseInt(productId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    createReview(productId, reviewData) {
        const reviews = readJSON(REVIEWS_FILE);
        const products = readJSON(PRODUCTS_FILE);
        
        const newId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
        const newReview = {
            id: newId,
            product_id: parseInt(productId),
            name: reviewData.name || "Anonymous",
            rating: parseInt(reviewData.rating),
            comment: reviewData.comment || "",
            created_at: new Date().toISOString()
        };
        reviews.push(newReview);
        writeJSON(REVIEWS_FILE, reviews);

        // Recalculate Product average rating (Relational sync)
        const productIndex = products.findIndex(p => p.id === parseInt(productId));
        if (productIndex !== -1) {
            const productReviews = reviews.filter(r => r.product_id === parseInt(productId));
            const sumRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
            const average = sumRating / productReviews.length;
            
            products[productIndex].rating = parseFloat(average.toFixed(1));
            products[productIndex].reviews_count = productReviews.length;
            writeJSON(PRODUCTS_FILE, products);
        }

        return newReview;
    },

    // --- Coupons ---
    validateCoupon(code) {
        const uppercaseCode = code.toUpperCase();
        if (PROMO_COUPONS[uppercaseCode]) {
            return PROMO_COUPONS[uppercaseCode];
        }
        return null;
    },

    // --- Orders ---
    getOrders(userId = null) {
        const orders = readJSON(ORDERS_FILE);
        const orderItems = readJSON(ORDER_ITEMS_FILE);
        const products = readJSON(PRODUCTS_FILE);

        let userOrders = orders;
        if (userId) {
            userOrders = orders.filter(o => o.user_id === parseInt(userId));
        }

        return userOrders.map(order => {
            const items = orderItems
                .filter(item => item.order_id === order.id)
                .map(item => {
                    const product = products.find(p => p.id === item.product_id);
                    return {
                        ...item,
                        product_name: product ? product.name : "Unknown Utensil",
                        product_image: product ? product.image_url : ""
                    };
                });
            return {
                ...order,
                items
            };
        }).sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    },

    createOrder(userId, shippingInfo, cartItems, couponCode = "") {
        const orders = readJSON(ORDERS_FILE);
        const orderItems = readJSON(ORDER_ITEMS_FILE);
        const products = readJSON(PRODUCTS_FILE);

        const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        
        let subtotal = 0;
        const itemsToSave = [];
        let nextItemId = orderItems.length > 0 ? Math.max(...orderItems.map(oi => oi.id)) + 1 : 1;

        for (const item of cartItems) {
            const product = products.find(p => p.id === parseInt(item.product_id));
            if (!product) throw new Error(`Product ID ${item.product_id} not found.`);
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
            }

            product.stock -= item.quantity;
            const finalPrice = product.price * (1 - product.discount_pct / 100);
            subtotal += finalPrice * item.quantity;

            itemsToSave.push({
                id: nextItemId++,
                order_id: orderId,
                product_id: product.id,
                size: item.size || "Standard",
                quantity: item.quantity,
                price: parseFloat(finalPrice.toFixed(2))
            });
        }

        // Coupon application math
        let discountAmount = 0;
        if (couponCode) {
            const coupon = this.validateCoupon(couponCode);
            if (coupon) {
                if (coupon.type === 'percentage') {
                    discountAmount = subtotal * (coupon.value / 100);
                } else if (coupon.type === 'flat') {
                    discountAmount = coupon.value;
                }
            }
        }
        
        const totalAmount = Math.max(0, subtotal - discountAmount);

        // Save updated products inventory
        writeJSON(PRODUCTS_FILE, products);

        // Save Order
        const newOrder = {
            id: orderId,
            user_id: parseInt(userId),
            order_date: new Date().toISOString(),
            total_amount: parseFloat(totalAmount.toFixed(2)),
            discount_amount: parseFloat(discountAmount.toFixed(2)),
            coupon_code: couponCode.toUpperCase(),
            status: "Processing",
            shipping_name: shippingInfo.name,
            shipping_address: shippingInfo.address,
            payment_method: shippingInfo.payment_method || "Cash on Delivery"
        };

        orders.push(newOrder);
        writeJSON(ORDERS_FILE, orders);

        // Save Order Items
        orderItems.push(...itemsToSave);
        writeJSON(ORDER_ITEMS_FILE, orderItems);

        return {
            ...newOrder,
            items: itemsToSave
        };
    },

    // --- Admin Dashboard Stats ---
    getStats() {
        const orders = readJSON(ORDERS_FILE);
        const products = readJSON(PRODUCTS_FILE);
        const users = readJSON(USERS_FILE);

        const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
        const customersCount = users.filter(u => u.role === 'customer').length;
        const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
        const outOfStockProducts = products.filter(p => p.stock === 0);

        // Group revenue by date for Chart.js
        const revenueSeries = {};
        orders.slice().sort((a, b) => new Date(a.order_date) - new Date(b.order_date)).forEach(o => {
            const dateStr = new Date(o.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            revenueSeries[dateStr] = (revenueSeries[dateStr] || 0) + o.total_amount;
        });

        const graphLabels = Object.keys(revenueSeries);
        const graphData = Object.values(revenueSeries);

        return {
            revenue: parseFloat(totalRevenue.toFixed(2)),
            ordersCount: orders.length,
            customersCount,
            inventoryAlerts: lowStockProducts.length + outOfStockProducts.length,
            lowStockItems: lowStockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stock })),
            outOfStockItems: outOfStockProducts.map(p => ({ id: p.id, name: p.name })),
            graph: {
                labels: graphLabels.length > 0 ? graphLabels : ["Jun 10", "Jun 11"],
                data: graphData.length > 0 ? graphData : [0, 0]
            }
        };
    }
};

// Auto initialize database files on load
db.init();

module.exports = db;
