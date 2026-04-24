const { db } = require("../db");

exports.getAlertasStock = (req, res) => {

  const sql = `
    SELECT *
    FROM productos
    WHERE cantidad <= minimo
  `;

  db.query(sql, (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

};