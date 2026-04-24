const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "sql5.freesqldatabase.com",
  user: "sql5823450",
  password: "tCbXXHpw7W",
  database: "sql5823450"
});

const dbPromise = db.promise();

db.connect(err => {
  if (err) {
    console.log("Error conectando a MySQL:", err);
  } else {
    console.log("Conectado a MySQL");
    db.query("SET time_zone = '-05:00'", (timezoneError) => {
      if (timezoneError) {
        console.log("Error configurando zona horaria de MySQL:", timezoneError);
      } else {
        console.log("Zona horaria MySQL configurada en America/Bogota (-05:00)");
      }
    });
  }
});

module.exports = { db, dbPromise };