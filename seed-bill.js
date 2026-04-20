const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sai918245@',
    database: 'smart_shopkeeper'
});

db.connect((err) => {
    if (err) {
        console.error('? Database connection failed:', err);
        process.exit(1);
    }
    console.log('? Connected to database');

    // Sample bill with items
    const bill = {
        bill_number: 'BILL-001',
        subtotal: 1000,
        gst_amount: 180,
        discount_amount: 50,
        final_total: 1130,
        customer_name: 'John Doe',
        customer_phone: '9876543210',
        items: JSON.stringify([
            { product_id: 1, name: 'Rice 1', qty: 2, price: 250, total: 500 },  
            { product_id: 2, name: 'Wheat Flour 1', qty: 1, price: 500, total: 500 }
        ])
    };

    const query = 'INSERT INTO bills (bill_number, subtotal, gst_amount, discount_amount, final_total, customer_name, customer_phone, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [
        bill.bill_number,
        bill.subtotal,
        bill.gst_amount,
        bill.discount_amount,
        bill.final_total,
        bill.customer_name,
        bill.customer_phone,
        bill.items
    ], (err, result) => {
        if (err) {
            console.error('? Error inserting bill:', err);
            db.end();
            process.exit(1);
        }

        console.log('? Sample bill added successfully!');
        console.log('Bill ID:', result.insertId);
        console.log('Bill Number:', bill.bill_number);
        console.log('Amount: ?' + bill.final_total);

        db.end();
        process.exit(0);
    });
});
