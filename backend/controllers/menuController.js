const { db } = require("../db");
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

exports.upload = upload;

exports.getMenu = (req, res) => {
  const sql = `
    SELECT 
      menu.*, 
      categorias.nombre AS categoria_nombre
    FROM menu
    LEFT JOIN categorias 
      ON menu.categoria_id = categorias.id
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error en el servidor' })
    }

    res.json(results)
  })
}

exports.getMenuById = (req, res) => {
  const { id } = req.params

  const sql = "SELECT * FROM menu WHERE id = ?"

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err)

    if (result.length === 0) {
      return res.status(404).json({ error: 'No encontrado' })
    }

    res.json(result[0])
  })
}

exports.getMenuPorCategoria = (req, res) => {

  const { categoria_id } = req.params;

  const sql = `
    SELECT *
    FROM menu
    WHERE categoria_id = ?
    ORDER BY nombre ASC
  `;

  db.query(sql, [categoria_id], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

};

exports.createMenu = (req, res) => {

  const { nombre, descripcion, precio, categoria_id, imagen_url } = req.body

  let imagen = imagen_url || null

  if (req.file) {
    imagen = `http://localhost:3000/uploads/${req.file.filename}`
  }

  const sql = `
    INSERT INTO menu (nombre, descripcion, precio, categoria_id, imagen, fecha_creacion)
    VALUES (?, ?, ?, ?, ?, NOW())
  `

  db.query(sql, [nombre, descripcion, precio, categoria_id, imagen], (err) => {
    if (err) return res.status(500).json(err)

    res.json({ success: true })
  })
}

exports.updateMenu = (req, res) => {
  const { id } = req.params
  const { nombre, descripcion, precio, categoria_id, imagen_url } = req.body

  let imagen = imagen_url || null

  if (req.file) {
    imagen = `http://localhost:3000/uploads/${req.file.filename}`
  }

  const sql = `
    UPDATE menu
    SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, imagen = ?
    WHERE id = ?
  `

  db.query(sql, [nombre, descripcion, precio, categoria_id, imagen, id], (err) => {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    res.json({ success: true })
  })
}

exports.getIngredientes = (req, res) => {

  const { menu_id } = req.params;

  const sql = `
    SELECT
      p.id,
      p.nombre,
      p.precio,
      p.imagen,
      mp.cantidad AS cantidad_base
    FROM menu_productos mp
    JOIN productos p ON p.id = mp.producto_id
    WHERE mp.menu_id = ?
    ORDER BY p.nombre ASC
  `;

  db.query(sql, [menu_id], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};