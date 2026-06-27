const mysql = require('mysql2');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  port: 3306,
});

const poolPromise = pool.promise();

console.log('Testing pool with config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

poolPromise.query('SELECT 1')
  .then(([rows]) => {
    console.log('Pool query success:', rows);
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Pool query error:', err);
    pool.end();
    process.exit(1);
  });
