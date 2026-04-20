const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sai918245@',
    database: 'smart_shopkeeper'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
    
    console.log('✅ Connected to database');
    
    // Base product names
    const baseProducts = [
        "Rice","Wheat Flour","Sugar","Salt","Cooking Oil","Milk","Curd","Butter","Paneer",
        "Bread","Eggs","Tea Powder","Coffee","Biscuits","Chocolates","Soap","Shampoo",
        "Toothpaste","Detergent","Face Wash","Hand Wash","Hair Oil","Sanitizer",
        "Notebook","Pen","Pencil","Water Bottle","Juice","Soft Drink","Chips",
        "Noodles","Pasta","Sauce","Pickle","Jam","Honey","Dry Fruits","Almonds",
        "Cashews","Raisins","Banana","Apple","Orange","Mango","Potato","Onion",
        "Tomato","Carrot","Cabbage","Spinach","Garlic","Ginger","Chicken",
        "Fish","Ice Cream","Cheese","Ketchup","Oats","Cornflakes","Baby Food",
        "Diapers","Tissue Paper","Cleaner","Room Spray","Battery","Charger",
        "USB Cable","Headphones","LED Bulb","Bucket","Mug","Dustbin","Broom",
        "Bed Sheet","Towel","Shirt","Pant","Shoes","Slippers","Watch","Wallet",
        "Backpack","Lunch Box","Umbrella","Helmet","Perfume","Deodorant"
    ];
    
    const categories = ["Grocery", "Retail", "Daily Use", "Beverages", "Electronics", "Personal Care"];
    
    let inserted = 0;
    
    // Insert 130 products
    for (let i = 1; i <= 130; i++) {
        const name = baseProducts[(i - 1) % baseProducts.length] + " " + i;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const quantity = Math.floor(Math.random() * 100);
        const price = Math.floor(Math.random() * 1000) + 20;
        const description = `Quality ${name} - Best price guaranteed`;
        
        db.query(
            'INSERT INTO products (name, category, quantity, price, description) VALUES (?, ?, ?, ?, ?)',
            [name, category, quantity, price, description],
            (err) => {
                if (err) {
                    console.error(`❌ Error inserting product ${i}:`, err.message);
                } else {
                    inserted++;
                    console.log(`✅ Product ${i}: ${name}`);
                    
                    // If all 130 are done, close connection
                    if (inserted === 130) {
                        console.log(`\n✅ Successfully added 130 products!`);
                        db.end();
                        process.exit(0);
                    }
                }
            }
        );
    }
});
