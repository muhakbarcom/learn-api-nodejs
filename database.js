const mysql = require("mysql");

// MySQL database connection setup local
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "firstdb",
});

// MySQL database connection setup online
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "u1024490_cashflowapp",
//   password: "cashflowapp",
//   database: "u1024490_cashflowdb",
// });

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to the database firstdb");
});

module.exports = db;
