const mysql = require('mysql2');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('Using config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '******' : '(empty)',
  database: process.env.DB_NAME,
  port: 3306,
});

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL server!');
  
  connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      connection.end();
      process.exit(1);
    }
    console.log(`Database ${process.env.DB_NAME} ensured!`);
    
    connection.changeUser({ database: process.env.DB_NAME }, (err) => {
      if (err) {
        console.error('Error switching database:', err);
        connection.end();
        process.exit(1);
      }
      
      connection.query('SHOW TABLES', (err, results) => {
        if (err) {
          console.error('Error listing tables:', err);
        } else {
          console.log('Tables in database:', results);
        }
        connection.end();
        process.exit(0);
      });
    });
  });
});
