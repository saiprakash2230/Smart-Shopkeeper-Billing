const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Initial connection to create database if needed
const initialDb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sai918245@',
    multipleStatements: true
});

function connectToDatabase() {
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Sai918245@',
        database: 'smart_shopkeeper',
        multipleStatements: true
    });

    db.connect((err) => {
        if (err) {
            if (err.code === 'ER_BAD_DB_ERROR') {
                // Database doesn't exist, create it
                console.log('Database not found, creating...');
                initialDb.connect((initErr) => {
                    if (initErr) {
                        console.error('❌ Initial connection failed:', initErr);
                        process.exit(1);
                    }
                    
                    initialDb.query('CREATE DATABASE smart_shopkeeper', (queryErr) => {
                        initialDb.end();
                        if (queryErr) {
                            console.error('❌ Error creating database:', queryErr);
                            process.exit(1);
                        }
                        console.log('✅ Database created. Connecting...');
                        setTimeout(() => connectToDatabase(), 500);
                    });
                });
            } else {
                console.error('❌ Database connection failed:', err);
                process.exit(1);
            }
            return;
        }
        
        console.log('✅ Connected to MySQL database (data preserved)');
        initializeTables(db);
    });
}

function initializeTables(db) {
    // Create tables only if they don't exist (preserve data on restart)
    const createUsers = `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    const createProducts = `CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100),
        quantity INT DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    const createBills = `CREATE TABLE IF NOT EXISTS bills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bill_number VARCHAR(50) UNIQUE,
        customer_name VARCHAR(100),
        customer_phone VARCHAR(20),
        subtotal DECIMAL(10,2) DEFAULT 0,
        gst_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        final_total DECIMAL(10,2) DEFAULT 0,
        items TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    // Create tables if they don't exist
    db.query(createUsers, (err) => {
        if (err) console.error('Create users error:', err);
        else console.log('✅ Users table ready');
    });
    
    db.query(createProducts, (err) => {
        if (err) console.error('Create products error:', err);
        else console.log('✅ Products table ready');
    });
    
    db.query(createBills, (err) => {
        if (err) console.error('Create bills error:', err);
        else console.log('✅ Bills table ready');
    });
    
    setupRoutes(db);
}

function setupRoutes(db) {
    // Middleware
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.static('templates'));
    app.set('view engine', 'ejs');
    app.set('views', './templates');

            // Session
            app.use(session({
                secret: 'smart_shopkeeper_secret_key',
                resave: false,
                saveUninitialized: true,
                cookie: { secure: false }
            }));

            // Make db available
            app.use((req, res, next) => {
                req.db = db;
                next();
            });

            // Authentication middleware
            function isAuthenticated(req, res, next) {
                if (req.session.user) {
                    next();
                } else {
                    res.redirect('/login');
                }
            }

            // Routes
            app.get('/', (req, res) => {
                if (req.session.user) res.redirect('/dashboard');
                else res.redirect('/login');
            });

            app.get('/login', (req, res) => {
                if (req.session.user) res.redirect('/dashboard');
                else res.sendFile(path.join(__dirname, 'templates', 'login.html'));
            });

            app.post('/login', (req, res) => {
                const { username, password } = req.body;
                
                if (!username || !password) {
                    return res.send('<script>alert("Please enter username and password!"); window.location="/login";</script>');
                }
                
                // Login with username only
                db.query('SELECT * FROM users WHERE username = ?', [username.trim()], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.send('<script>alert("Database error! Please try again."); window.location="/login";</script>');
                    }
                    
                    if (results && results.length > 0) {
                        // Use bcrypt to compare hashed password
                        bcrypt.compare(password.trim(), results[0].password, (bcryptErr, isPasswordValid) => {
                            if (bcryptErr) {
                                console.error('Password comparison error:', bcryptErr);
                                return res.send('<script>alert("Authentication error!"); window.location="/login";</script>');
                            }
                            
                            if (isPasswordValid) {
                                req.session.user = results[0];
                                console.log('✅ User logged in:', results[0].username);
                                res.redirect('/dashboard');
                            } else {
                                return res.send('<script>alert("Invalid credentials!"); window.location="/login";</script>');
                            }
                        });
                    } else {
                        return res.send('<script>alert("Invalid credentials!"); window.location="/login";</script>');
                    }
                });
            });

            app.get('/register', (req, res) => {
                res.sendFile(path.join(__dirname, 'templates', 'register.html'));
            });

            app.post('/register', (req, res) => {
                const { username, email, password, full_name } = req.body;
                
                // Validation
                if (!username || !email || !password || !full_name) {
                    return res.send('<script>alert("All fields are required!"); window.location="/register";</script>');
                }
                
                if (password.length < 6) {
                    return res.send('<script>alert("Password must be at least 6 characters!"); window.location="/register";</script>');
                }
                
                if (!email.includes('@')) {
                    return res.send('<script>alert("Please enter a valid email!"); window.location="/register";</script>');
                }
                
                // Hash password
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error('Password hashing error:', err);
                        return res.send('<script>alert("Registration error!"); window.location="/register";</script>');
                    }
                    
                    // Insert user with hashed password
                    db.query('INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)', 
                        [username, email, hashedPassword, full_name], 
                        (err, result) => {
                            if (err) {
                                if (err.code === 'ER_DUP_ENTRY') {
                                    return res.send('<script>alert("Email already exists!"); window.location="/register";</script>');
                                }
                                console.error('Registration error:', err);
                                return res.send('<script>alert("Registration error!"); window.location="/register";</script>');
                            }
                            
                            console.log('✅ New user registered:', { email, full_name });
                            res.send('<script>alert("✅ Registration successful! Please login."); window.location="/login";</script>');
                        }
                    );
                });
            });

            app.get('/dashboard', isAuthenticated, (req, res) => {
                res.sendFile(path.join(__dirname, 'templates', 'dashboard.html'));
            });

            app.get('/add_product', isAuthenticated, (req, res) => {
                res.sendFile(path.join(__dirname, 'templates', 'add_product.html'));
            });

            app.post('/add_product', isAuthenticated, (req, res) => {
                const { name, category, quantity, price, description } = req.body;
                
                console.log('Add product request:', { name, category, quantity, price, description });
                
                if (!name || !price) {
                    return res.json({ success: false, error: "Name and price are required!" });
                }
                
                db.query('INSERT INTO products (name, category, quantity, price, description) VALUES (?, ?, ?, ?, ?)', 
                    [name, category || 'General', parseInt(quantity) || 0, parseFloat(price) || 0, description || ''], 
                    (err, result) => {
                        if (err) {
                            console.error('Add product error:', err.message);
                            return res.json({ success: false, error: err.message });
                        } else {
                            console.log('✅ Product added:', name);
                            res.json({ success: true, message: "Product added successfully!", productName: name });
                        }
                    });
            });

            app.get('/view_products', isAuthenticated, (req, res) => {
                res.sendFile(path.join(__dirname, 'templates', 'view_products.html'));
            });

            app.get('/delete_product/:id', isAuthenticated, (req, res) => {
                db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
                    if (err) {
                        console.error('Delete product error:', err);
                        return res.json({ success: false, error: err.message });
                    }
                    res.json({ success: true, message: "Product deleted successfully!" });
                });
            });

            app.post('/update_product/:id', isAuthenticated, (req, res) => {
                const { name, category, quantity, price, description } = req.body;
                
                // If only quantity is provided (from stock update modal)
                if (quantity !== undefined && !name) {
                    db.query('UPDATE products SET quantity=? WHERE id=?',
                        [parseInt(quantity), req.params.id],
                        (err) => {
                            if (err) {
                                console.error('Update quantity error:', err);
                                return res.json({ success: false, error: err.message });
                            }
                            res.json({ success: true, message: "Stock updated successfully!" });
                        });
                } else {
                    // Full product update (from edit form)
                    db.query('UPDATE products SET name=?, category=?, quantity=?, price=?, description=? WHERE id=?',
                        [name, category, parseInt(quantity), parseFloat(price), description, req.params.id],
                        (err) => {
                            if (err) {
                                console.error('Update product error:', err);
                                return res.json({ success: false, error: err.message });
                            }
                            res.redirect('/view_products');
                        });
                }
            });

            app.get('/billing', isAuthenticated, (req, res) => {
                res.sendFile(path.join(__dirname, 'templates', 'billing.html'));
            });

            app.post('/generate_bill', isAuthenticated, (req, res) => {
                const { items, subtotal, gst, discount, final_total, customer_name, customer_phone } = req.body;
                const billNumber = 'BILL-' + Date.now();
                let itemsArray = items;
                
                if (typeof items === 'string') {
                    itemsArray = JSON.parse(items);
                }
                
                db.query('INSERT INTO bills (bill_number, customer_name, customer_phone, subtotal, gst_amount, discount_amount, final_total, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [billNumber, customer_name || 'Walk-in Customer', customer_phone || '', parseFloat(subtotal) || 0, parseFloat(gst) || 0, parseFloat(discount) || 0, parseFloat(final_total) || 0, JSON.stringify(itemsArray)],
                    (err) => {
                        if (err) {
                            console.error(err);
                            res.json({ success: false, error: err.message });
                        } else {
                            // Update stock
                            if (itemsArray && itemsArray.length) {
                                itemsArray.forEach(item => {
                                    db.query('UPDATE products SET quantity = quantity - ? WHERE name = ?', [parseInt(item.qty), item.name]);
                                });
                            }
                            res.json({ success: true, billNumber: billNumber });
                        }
                    });
            });

            app.get('/bill_history', isAuthenticated, (req, res) => {
                res.sendFile(path.join(__dirname, 'templates', 'bill_history.html'));
            });

            app.get('/bill_details/:id', isAuthenticated, (req, res) => {
                db.query('SELECT * FROM bills WHERE id = ?', [req.params.id], (err, bills) => {
                    if (err || !bills || bills.length === 0) {
                        res.json({ error: 'Not found' });
                    } else {
                        const bill = bills[0];
                        try {
                            bill.items = JSON.parse(bill.items || '[]');
                        } catch(e) {
                            bill.items = [];
                        }
                        res.json(bill);
                    }
                });
            });

            app.delete('/delete_bill/:id', isAuthenticated, (req, res) => {
                db.query('DELETE FROM bills WHERE id = ?', [req.params.id], (err) => {
                    res.json({ success: !err });
                });
            });

            app.get('/stock_report', isAuthenticated, (req, res) => {
                res.sendFile(path.join(__dirname, 'templates', 'stock_report.html'));
            });

            app.get('/logout', (req, res) => {
                req.session.destroy();
                res.redirect('/login');
            });

            // API endpoints
            app.get('/api/check-auth', (req, res) => {
                if (req.session.user) {
                    res.json({ authenticated: true, user: req.session.user });
                } else {
                    res.json({ authenticated: false });
                }
            });

            app.get('/api/sales-by-day', (req, res) => {
                const query = `
                    SELECT DATE(created_at) as date, SUM(final_total) as total_sales, COUNT(*) as bill_count
                    FROM bills
                    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC
                    LIMIT 7
                `;
                
                db.query(query, (err, results) => {
                    if (err) {
                        console.error('Sales data error:', err);
                        return res.json({ error: err.message, data: [] });
                    }
                    
                    res.json({ success: true, data: results.reverse() });
                });
            });

            app.get('/api/products', (req, res) => {
                const query = 'SELECT id, name, category, quantity, price, description FROM products';
                db.query(query, (err, results) => {
                    if (err) {
                        console.error('Products fetch error:', err);
                        return res.json([]);
                    }
                    res.json(results);
                });
            });

            app.get('/api/bills', (req, res) => {
                const query = 'SELECT id, bill_number, customer_name, customer_phone, subtotal, gst_amount, discount_amount, final_total, items, created_at FROM bills ORDER BY created_at DESC';
                db.query(query, (err, results) => {
                    if (err) {
                        console.error('Bills fetch error:', err);
                        return res.json([]);
                    }
                    // Parse items JSON for each bill
                    const bills = results.map(bill => ({
                        ...bill,
                        items: JSON.parse(bill.items || '[]')
                    }));
                    res.json(bills);
                });
            });

            // Start server
            app.listen(PORT, () => {
                console.log(`\n🚀 Server running on http://localhost:${PORT}`);
                console.log(`📝 Login: http://localhost:${PORT}/login`);
                console.log(`📝 Register: http://localhost:${PORT}/register\n`);
            });
}

// Start the connection chain
connectToDatabase();