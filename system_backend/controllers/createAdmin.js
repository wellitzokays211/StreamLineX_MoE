// createAdmin.js

const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose(); // Or use mysql2 for MySQL

const db = new sqlite3.Database('your-database-file.db'); // Adjust this if you're using MySQL

async function createAdmin() {
  const username = 'admin';
  const plainPassword = 'yourAdminPasswordHere';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  db.run(
    'INSERT INTO admin (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function (err) {
      if (err) {
        return console.error('Error inserting admin:', err.message);
      }
      console.log('✅ Admin user created successfully!');
      db.close();
    }
  );
}

createAdmin();
