// test_db.js - Automated Database and Transaction Verification
const db = require('./db');

function assert(condition, message) {
    if (!condition) {
        console.error(`  [FAIL] ${message}`);
        process.exit(1);
    } else {
        console.log(`  [PASS] ${message}`);
    }
}

console.log("=================================================");
console.log("      RUNNING DATABASE INTEGRITY VERIFICATIONS   ");
console.log("=================================================");

// Test 1: Seed verification
console.log("\nTest 1: Seeding & Basic Queries...");
const allProducts = db.getProducts();
assert(allProducts.length >= 10, `Expected at least 10 products, found ${allProducts.length}`);
assert(allProducts[0].name.includes("Brass"), "First product should contain 'Brass'");

// Test 2: Material filtering
console.log("\nTest 2: Material Filter Queries...");
const copperItems = db.getProducts({ material: "Copper" });
assert(copperItems.length >= 2, `Expected at least 2 copper items, found ${copperItems.length}`);

// Test 3: Reviews loading
console.log("\nTest 3: Reviews Loading Feed...");
const reviews = db.getReviews(1);
assert(reviews.length >= 2, `Expected at least 2 reviews for product 1, got ${reviews.length}`);
assert(reviews[0].name === "Suresh Patel" || reviews[1].name === "Suresh Patel", "Suresh Patel review should exist");

// Test 4: Creating review and rating sync
console.log("\nTest 4: Review Creation & Rating Synchronization...");
const testProduct = db.createProduct({
    name: "Test Utensil",
    price: 500,
    stock: 10,
    category: "Accessories",
    material: "Copper"
});

assert(testProduct.reviews_count === 0, "New product reviews count should be 0");

// Create first review
db.createReview(testProduct.id, { name: "Test Reviewer", rating: 4, comment: "Decent item." });
const productAfter = db.getProductById(testProduct.id);
assert(productAfter.reviews_count === 1, `Expected reviews count to be 1, got ${productAfter.reviews_count}`);
assert(productAfter.rating === 4.0, `Expected rating average to be 4.0, got ${productAfter.rating}`);

// Create second review
db.createReview(testProduct.id, { name: "Another Reviewer", rating: 5, comment: "Fabulous!" });
const productAfter2 = db.getProductById(testProduct.id);
assert(productAfter2.reviews_count === 2, `Expected reviews count to be 2, got ${productAfter2.reviews_count}`);
assert(productAfter2.rating === 4.5, `Expected rating average to be 4.5, got ${productAfter2.rating}`);

// Test 5: Coupon validation check
console.log("\nTest 5: Discount Coupon Validity checks...");
const validCoupon = db.validateCoupon("FESTIVE15");
assert(validCoupon !== null, "FESTIVE15 should be a valid coupon code");
assert(validCoupon.type === "percentage" && validCoupon.value === 15, "FESTIVE15 should be a 15% discount");

const invalidCoupon = db.validateCoupon("INVALIDCODE");
assert(invalidCoupon === null, "INVALIDCODE should be invalid");

// Test 6: Order Checkout with Discount Deductions
console.log("\nTest 6: Order Checkout with Coupon Math deductions...");
const newUser = db.createUser({
    name: "Regular Customer",
    email: "regular@ramdev.com",
    password: "pass12345password"
});

const castIron = db.getProductById(3);
const originalStock = castIron.stock;

// Calculate expected price
const itemPrice = castIron.price * (1 - castIron.discount_pct / 100); 
const cartItems = [{ product_id: 3, size: "2.5 Litre", quantity: 1 }];
const shippingInfo = { name: "Regular Customer", address: "Sector 15, Dwarka, Delhi", payment_method: "Credit Card" };

// Place order with FESTIVE15 coupon (15% off)
const order = db.createOrder(newUser.id, shippingInfo, cartItems, "FESTIVE15");

const expectedSubtotal = itemPrice; // 1279.20
const expectedDiscount = expectedSubtotal * 0.15; // 191.88
const expectedTotal = expectedSubtotal - expectedDiscount; // 1087.32

assert(order.discount_amount === parseFloat(expectedDiscount.toFixed(2)), `Expected discount to be ${expectedDiscount.toFixed(2)}, got ${order.discount_amount}`);
assert(order.total_amount === parseFloat(expectedTotal.toFixed(2)), `Expected total paid to be ${expectedTotal.toFixed(2)}, got ${order.total_amount}`);

// Verify stock deduction
const castIronAfter = db.getProductById(3);
assert(castIronAfter.stock === originalStock - 1, `Expected stock to go from ${originalStock} to ${originalStock - 1}, got ${castIronAfter.stock}`);

// Test 7: Admin Statistics
console.log("\nTest 7: Admin Statistics Aggregates...");
const stats = db.getStats();
assert(stats.ordersCount > 0, "Orders count should be populated");
assert(stats.graph.labels.length > 0, "Revenue chart series should contain labels");

console.log("\n=================================================");
console.log("   ALL UPGRADED DATABASE CHECKS PASSED           ");
console.log("=================================================");
process.exit(0);
