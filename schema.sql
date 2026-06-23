-- Ramdev Super Store - MySQL Database Schema
-- You can import this file directly into your MySQL database server.

CREATE DATABASE IF NOT EXISTS ramdev_super_store;
USE ramdev_super_store;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Stored as bcrypt hash in production
    role VARCHAR(20) DEFAULT 'customer', -- 'customer' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Kitchen Utensils & Cookware)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_pct INT DEFAULT 0, -- discount percentage (e.g. 15 for 15% off)
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    category VARCHAR(50) NOT NULL, -- Cookware, Serveware, Dinnerware, Cutlery, Accessories
    material VARCHAR(50) NOT NULL, -- Copper, Brass, Stainless Steel, Cast Iron, Ceramic
    sizes VARCHAR(100), -- Comma-separated sizes, e.g. "1 Litre, 2 Litre, 3.5 Litre" or "Small, Medium, Large"
    rating DECIMAL(3, 2) DEFAULT 4.50,
    reviews_count INT DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g. "ORD-12345"
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Processing', -- Processing, Shipped, Delivered, Cancelled
    shipping_name VARCHAR(150) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    size VARCHAR(30),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Price at the time of purchase (after discount)
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
