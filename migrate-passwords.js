const mysql = require('mysql2');
const bcrypt = require('bcrypt');

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
    
    // Fetch all users
    db.query('SELECT id, password FROM users', (err, users) => {
        if (err) {
            console.error('❌ Error fetching users:', err);
            db.end();
            process.exit(1);
        }
        
        if (users.length === 0) {
            console.log('✅ No users to migrate');
            db.end();
            process.exit(0);
        }
        
        let migrated = 0;
        let skipped = 0;
        
        users.forEach(user => {
            // Check if password is already hashed (hashed passwords are usually 60 chars)
            if (user.password.length > 50) {
                console.log(`⏭️  User ID ${user.id}: Already hashed`);
                skipped++;
                return;
            }
            
            // Hash the plaintext password
            bcrypt.hash(user.password, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error(`❌ Error hashing user ${user.id}:`, hashErr);
                    return;
                }
                
                // Update the user with hashed password
                db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (updateErr) => {
                    if (updateErr) {
                        console.error(`❌ Error updating user ${user.id}:`, updateErr);
                    } else {
                        console.log(`✅ User ID ${user.id}: Password encrypted`);
                        migrated++;
                        
                        // If all done, close connection
                        if (migrated + skipped === users.length) {
                            console.log(`\n✅ Migration complete: ${migrated} passwords encrypted, ${skipped} already hashed`);
                            db.end();
                            process.exit(0);
                        }
                    }
                });
            });
        });
    });
});
