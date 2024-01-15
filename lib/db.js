let mysql = require('mysql2');

// let connection = mysql.createConnection({
//     host: "db-mysql-sgp1-97491-do-user-15189228-0.c.db.ondigitalocean.com",
//     // host: "143.198.204.198",
//     port: "25060",
//     user: "doadmin",
//     password: "AVNS_IKINUKQWMet80AW4HPc",
//     database: "nodejs_dog_community_db"
// })

let connection = mysql.createConnection({
    host: "localhost",
    // host: "143.198.204.198",
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