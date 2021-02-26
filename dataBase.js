var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "bh_test",
})
connection.connect((err) => {

    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE employee2 (id INT PRIMARY KEY, name VARCHAR(255), age INT(3), city VARCHAR(255))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");

    });
});
console.log(789)