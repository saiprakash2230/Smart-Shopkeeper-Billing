# Smart Shopkeeper - Billing & Inventory Management System

## Overview

The **Smart Shopkeeper** is a web-based application designed to digitize and streamline daily billing and inventory operations for small to medium-sized retail shops. It replaces traditional manual billing methods—which are slow, error-prone, and lack real-time tracking—with an integrated digital solution. The system enables shopkeepers to generate bills quickly, automatically update stock levels after each sale, manage product catalogs, view sales reports, and receive low-stock alerts. The ultimate goal is to save time, reduce human errors, and empower shopkeepers with data-driven insights to grow their business.

---

## Features

### Functional Requirements

| Module | Features |
|--------|----------|
| **Product Management** | Add, edit, delete, and search products; bulk upload via Excel/CSV; category management |
| **Billing / Cart** | Add items to cart, apply discounts (percentage or fixed), calculate GST/tax, generate printable invoice |
| **Inventory Tracking** | Auto-update stock after each sale; low-stock alerts; stock adjustment log for damage/expiry |
| **Sales Reports** | Daily, weekly, monthly sales summary; profit calculation; top-selling products |
| **Customer Management** | Add/view customers; purchase history; track credit dues (optional) |

### Non-Functional Requirements

- Fast and responsive interface for quick billing (under 2 seconds per transaction)
- Secure login with role-based access (Owner, Cashier, Stock Manager)
- Reliable database with automatic backup to prevent data loss
- Clean, printable invoice format (thermal/A4 compatible)

---

## Technology Stack (Suggested)

| Layer | Technology |
|-------|-------------|
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript |
| Backend | PHP (Laravel) / Node.js / Python (Django) |
| Database | MySQL or PostgreSQL |
| Reporting | Chart.js / Google Charts for graphs |
| PDF Generation | DomPDF / jsPDF |
| Hosting | Local (XAMPP/WAMP) or Cloud (AWS, Hostinger) |

---

## System Architecture (Simplified)
The system requires functional modules for product management, billing with GST/discounts, automated inventory tracking, sales reporting, and customer history. Non-functional needs include a fast interface, secure role-based login, reliable database backup, and printable invoices.

The system requires functional modules for product management, billing with GST/discounts, automated inventory tracking, sales reporting, and customer history. Non-functional needs include a fast interface, secure role-based login, reliable database backup, and printable invoices.

[User] → [Web Browser] → [Frontend UI] → [Backend API/Controller]
↓
[Database]
↓
[Stock Update | Bill Record]


---

## Database Schema (Key Tables)

### `products`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(100) | Product name |
| category | VARCHAR(50) | Category (e.g., Grocery) |
| buying_price | DECIMAL(10,2) | Cost price |
| selling_price | DECIMAL(10,2) | Selling price |
| stock_quantity | INT | Current stock |
| reorder_level | INT | Minimum stock alert |
| unit | VARCHAR(10) | kg, liter, piece |

### `bills`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Bill number |
| customer_id | INT (FK) | Optional customer link |
| total_amount | DECIMAL(10,2) | Before tax |
| tax_amount | DECIMAL(10,2) | GST total |
| grand_total | DECIMAL(10,2) | Final amount |
| payment_mode | ENUM | cash/card/upi/credit |
| bill_date | DATETIME | Auto timestamp |

### `bill_items`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | - |
| bill_id | INT (FK) | Links to bills |
| product_id | INT (FK) | Links to products |
| quantity | INT | Sold quantity |
| price | DECIMAL(10,2) | Selling price at time of sale |

### `customers`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | - |
| name | VARCHAR(100) | Customer name |
| phone | VARCHAR(15) | Unique |
| total_due | DECIMAL(10,2) | Pending credit |

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | - |
| username | VARCHAR(50) | Unique |
| password | VARCHAR(255) | Hashed |
| role | ENUM | owner / cashier / stock_manager |

---

## Installation & Setup

### Prerequisites
- PHP 7.4+ (if using PHP backend) or Node.js (if using JavaScript backend)
- MySQL 5.7+
- Web server (Apache/Nginx) or XAMPP/WAMP for local development

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-shopkeeper.git
   cd smart-shopkeeper
