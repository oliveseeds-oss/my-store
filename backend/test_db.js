const mysql = require('mysql2');
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'mystore',
  port: 3306,
});
pool.query('SELECT 1', (err, results) => {
  if (err) {
    console.log('DB_ERROR:', err.message);
  } else {
    console.log('DB_SUCCESS:', results);
  }
  pool.end();
  process.exit(0);
});
