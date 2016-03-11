



var config = {
    host: 'localhost',
    port: 3306,
    database: 'test',
    user: 'root',
    passwrod: 'root'
};


var mysql = require('mysql');

var connection = mysql.createConnection(config);

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

connection.end();
