const mysql = require('promise-mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'devuser',
  port: 33060,
  password: 'devuser',
  database: 'electrondb'
});

function getConnection() {
  return connection;
}

module.exports = { getConnection };