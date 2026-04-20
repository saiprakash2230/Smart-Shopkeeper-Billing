
-- Smart Shopkeeper Database Schema

DROP DATABASE IF EXISTS smart_shopkeeper;
CREATE DATABASE smart_shopkeeper;
USE smart_shopkeeper;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    quantity INT DEFAULT 0 CHECK (quantity >= 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    cost_price DECIMAL(10,2),
    description TEXT,
    image VARCHAR(255),
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_name (name),
    INDEX idx_category (category_id),
    INDEX idx_quantity (quantity)
);

-- Bills Table
CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bill_number VARCHAR(50) UNIQUE,
    subtotal DECIMAL(10,2) DEFAULT 0,
    gst DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    final_total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('completed', 'cancelled', 'pending') DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_date (created_at),
    INDEX idx_status (status)
);

-- Bill Items Table
CREATE TABLE bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_bill (bill_id),
    INDEX idx_product (product_id)
);

-- Sales Report Table
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    items_sold INT DEFAULT 0,
    total_bills INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- Stock History Table (for tracking stock changes)
CREATE TABLE stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    old_quantity INT,
    new_quantity INT,
    change_type ENUM('purchase', 'sale', 'adjustment', 'damage') DEFAULT 'adjustment',
    reference_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_date (created_at)
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Grocery', 'Food and grocery items'),
('Dairy & Eggs', 'Milk, dairy products, and eggs'),
('Cosmetics & Personal Care', 'Cosmetics and personal care items'),
('Daily Use Items', 'Daily household use items'),
('Snacks & Beverages', 'Snacks and beverages'),
('Cleaning Supplies', 'Cleaning and maintenance supplies');

-- Insert Users
INSERT INTO users (name, email, password, phone, address) VALUES
('Admin User', 'admin@smartshopkeeper.com', 'admin@123', '9876543210', '123 Main Street'),
('Sai Prakash', 'sai@smartshopkeeper.com', 'sai@123', '9876543211', '456 Second Avenue'),
('Shop Manager', 'manager@smartshopkeeper.com', 'manager@123', '9876543212', '789 Third Road');

-- Insert Products
INSERT INTO products (name, category_id, quantity, price, cost_price, description, sku) VALUES
('Basmati Rice 25kg', 1, 45, 1200.00, 900.00, 'Premium basmati rice', 'RICE001'),
('Wheat Flour 10kg', 1, 30, 450.00, 350.00, 'Pure wheat flour', 'FLOUR001'),
('Sugar 5kg', 1, 25, 250.00, 200.00, 'White sugar', 'SUGAR001'),
('Salt 1kg', 1, 60, 50.00, 30.00, 'Refined salt', 'SALT001'),
('Cooking Oil 1L', 1, 35, 150.00, 120.00, 'Sunflower cooking oil', 'OIL001'),
('Fresh Milk 1L', 2, 40, 60.00, 45.00, 'Fresh pasteurized milk', 'MILK001'),
('Curd 500g', 2, 20, 40.00, 30.00, 'Fresh curd', 'CURD001'),
('Butter 250g', 2, 15, 200.00, 160.00, 'Dairy butter', 'BUTTER001'),
('Eggs (Dozen)', 2, 18, 90.00, 70.00, 'Fresh farm eggs', 'EGGS001'),
('Soap Bar', 3, 80, 25.00, 15.00, 'Bath soap', 'SOAP001'),
('Shampoo 500ml', 3, 12, 120.00, 90.00, 'Hair shampoo', 'SHAMP001'),
('Toothpaste 100g', 3, 25, 50.00, 35.00, 'Fluoride toothpaste', 'TPASTE001'),
('Hand Wash 200ml', 3, 30, 40.00, 28.00, 'Antibacterial hand wash', 'HWASH001'),
('Detergent Powder 1kg', 4, 50, 80.00, 60.00, 'Laundry detergent', 'DETERG001'),
('Brooms', 4, 22, 60.00, 40.00, 'Cleaning brooms', 'BROOM001'),
('Bucket 10L', 4, 10, 120.00, 90.00, 'Plastic bucket', 'BUCKET001'),
('Biscuits Pack 200g', 5, 45, 50.00, 35.00, 'Butter biscuits', 'BISC001'),
('Chips Pack 100g', 5, 60, 30.00, 18.00, 'Potato chips', 'CHIPS001'),
('Juice 1L', 5, 25, 70.00, 50.00, 'Natural fruit juice', 'JUICE001'),
('Soft Drink 500ml', 5, 100, 40.00, 25.00, 'Carbonated drink', 'SODA001');

-- Insert Bills (Transactions)
INSERT INTO bills (user_id, bill_number, subtotal, gst, discount, final_total, payment_method, status) VALUES
(1, 'BILL-2026-0001', 3000.00, 540.00, 0.00, 3540.00, 'Cash', 'completed'),
(1, 'BILL-2026-0002', 1500.00, 270.00, 100.00, 1670.00, 'Card', 'completed'),
(2, 'BILL-2026-0003', 2500.00, 450.00, 0.00, 2950.00, 'Cash', 'completed'),
(1, 'BILL-2026-0004', 4200.00, 756.00, 200.00, 4756.00, 'UPI', 'completed'),
(2, 'BILL-2026-0005', 1800.00, 324.00, 50.00, 2074.00, 'Cash', 'completed');

-- Insert Bill Items
INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 2, 1200.00, 2400.00),
(1, 6, 5, 60.00, 300.00),
(1, 9, 2, 90.00, 180.00),
(1, 10, 3, 25.00, 75.00),
(2, 2, 1, 450.00, 450.00),
(2, 11, 2, 120.00, 240.00),
(2, 17, 4, 50.00, 200.00),
(2, 18, 3, 30.00, 90.00),
(3, 5, 2, 150.00, 300.00),
(3, 7, 8, 40.00, 320.00),
(3, 14, 2, 80.00, 160.00),
(3, 15, 5, 60.00, 300.00),
(3, 19, 5, 70.00, 350.00),
(3, 20, 12, 40.00, 480.00),
(4, 1, 1, 1200.00, 1200.00),
(4, 3, 2, 250.00, 500.00),
(4, 8, 3, 200.00, 600.00),
(4, 12, 4, 50.00, 200.00),
(4, 16, 2, 120.00, 240.00),
(4, 18, 6, 30.00, 180.00),
(4, 20, 4, 40.00, 160.00),
(5, 4, 10, 50.00, 500.00),
(5, 6, 3, 60.00, 180.00),
(5, 13, 4, 40.00, 160.00),
(5, 17, 8, 50.00, 400.00),
(5, 19, 2, 70.00, 140.00);

-- Insert Sales Report
INSERT INTO sales (date, total_sales, total_profit, items_sold, total_bills) VALUES
('2026-04-01', 3540.00, 1416.00, 18, 1),
('2026-04-02', 1670.00, 668.00, 9, 1),
('2026-04-03', 2950.00, 1180.00, 25, 1),
('2026-04-04', 4756.00, 1902.40, 28, 1),
('2026-04-05', 2074.00, 829.60, 20, 1),
('2026-04-06', 5000.00, 2000.00, 35, 2),
('2026-04-07', 6500.00, 2600.00, 42, 3),
('2026-04-08', 4200.00, 1680.00, 28, 2),
('2026-04-09', 7000.00, 2800.00, 48, 3),
('2026-04-10', 5500.00, 2200.00, 38, 2),
('2026-04-11', 8500.00, 3400.00, 55, 4),
('2026-04-12', 6200.00, 2480.00, 42, 3),
('2026-04-13', 7800.00, 3120.00, 50, 3),
('2026-04-14', 5300.00, 2120.00, 36, 2),
('2026-04-15', 6800.00, 2720.00, 44, 3);

-- Create Views for easy data retrieval
CREATE VIEW vw_product_stock_status AS
SELECT 
    p.id,
    p.name,
    c.name as category,
    p.quantity,
    p.price,
    CASE 
        WHEN p.quantity <= 2 THEN 'Critical'
        WHEN p.quantity <= 5 THEN 'Low'
        ELSE 'In Stock'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.quantity ASC;

CREATE VIEW vw_daily_sales AS
SELECT 
    s.date,
    s.total_sales,
    s.total_profit,
    s.items_sold,
    s.total_bills,
    ROUND((s.total_profit / s.total_sales * 100), 2) as profit_margin
FROM sales s
ORDER BY s.date DESC;

CREATE VIEW vw_bill_details AS
SELECT 
    b.id,
    b.bill_number,
    u.name as user_name,
    b.subtotal,
    b.gst,
    b.discount,
    b.final_total,
    b.payment_method,
    b.status,
    COUNT(bi.id) as total_items,
    b.created_at
FROM bills b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN bill_items bi ON b.id = bi.bill_id
GROUP BY b.id
ORDER BY b.created_at DESC;