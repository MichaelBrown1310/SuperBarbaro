const { db } = require("../db");

exports.getProductosPorCategoria = (req, res) => {

  const { id_categoria } = req.params;

  const sql = `
    SELECT p.*
    FROM productos p
    JOIN producto_categoria pc ON p.id = pc.producto_id
    WHERE pc.categoria_id = ?
  `;

  db.query(sql, [id_categoria], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });

};

exports.getProductoById = (req, res) => {

  const { id } = req.params;

  const sql = "SELECT * FROM productos WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });

};

exports.buscarProductos = (req, res) => {

  const { q } = req.query;

  const sql = `
    SELECT p.*
    FROM productos p
    WHERE p.nombre LIKE ?
  `;

  db.query(sql, [`%${q}%`], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

};

exports.getCategorias = (req, res) => {

  db.query("SELECT * FROM categorias", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

};

exports.createCategoria = (req, res) => {

  const { nombre, imagen } = req.body;

  db.query(
    "INSERT INTO categorias (nombre, imagen) VALUES (?,?)",
    [nombre, imagen],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );

};

exports.createProducto = (req, res) => {

  const { nombre, precio, cantidad, imagen, categoria, minimo } = req.body;

  if (!nombre || !precio || !cantidad || !categoria) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sqlCategoria = "SELECT id FROM categorias WHERE nombre = ?";

  db.query(sqlCategoria, [categoria], (err, resultCat) => {

    if (err) return res.status(500).json(err);

    if (resultCat.length === 0) {
      return res.status(400).json({ error: "Categoría no existe" });
    }

    const categoria_id = resultCat[0].id;

    const sqlProducto = `
      INSERT INTO productos (nombre, precio, cantidad, imagen, minimo)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sqlProducto, [nombre, precio, cantidad, imagen, minimo || 10], (err, result) => {

      if (err) return res.status(500).json(err);

      const productoId = result.insertId;

      const sqlRelacion = `
        INSERT INTO producto_categoria (producto_id, categoria_id)
        VALUES (?, ?)
      `;

      db.query(sqlRelacion, [productoId, categoria_id], (err2) => {

        if (err2) return res.status(500).json(err2);

        res.json({ success: true });

      });

    });

  });

};

exports.updateProducto = (req, res) => {

  const { id } = req.params;
  const { nombre, precio, cantidad, imagen, minimo } = req.body;

  const sql = `
    UPDATE productos
    SET nombre=?, precio=?, cantidad=?, imagen=?, minimo=?
    WHERE id=?
  `;

  db.query(sql, [nombre, precio, cantidad, imagen, minimo, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

};

exports.deleteProducto = (req, res) => {

  const { id } = req.params;

  db.query("DELETE FROM producto_categoria WHERE producto_id=?", [id]);

  db.query("DELETE FROM productos WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

};

exports.createMovimiento = (req, res) => {

  const { producto_id, tipo, cantidad, motivo } = req.body;

  db.query(
    `INSERT INTO movimientos_productos 
     (producto_id, tipo, cantidad, motivo) 
     VALUES (?, ?, ?, ?)`,
    [producto_id, tipo, cantidad, motivo],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ mensaje: "Movimiento guardado" });
    }
  );

};

exports.getMovimientos = (req, res) => {

  const { producto_id } = req.params;

  db.query(
    `SELECT * FROM movimientos_productos 
     WHERE producto_id = ?
     ORDER BY fecha DESC`,
    [producto_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );

};