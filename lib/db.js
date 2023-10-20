let mysql = require('mysql');
let connection = mysql.createConnection({
    host: "localhost",
    port: "4306",
    user: "root",
    password: "",
    database: "nodejs_dog_community_db"
})

connection.connect((error) => {
    if (!!error) {
        console.log(error);
    } else {
        console.log('Connected...');
    }
})

module.exports = connection;