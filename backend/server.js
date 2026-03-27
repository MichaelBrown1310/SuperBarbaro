const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "superbarbaro"
});

db.connect(err => {
  if (err) {
    console.log("Error conectando a MySQL:", err);
  } else {
    console.log("Conectado a MySQL");
  }
});


// LOGIN
app.post("/login", (req, res) => {

  const { codigo, password } = req.body;

  const sql = "SELECT * FROM usuarios WHERE codigo = ? AND password = ?";

  db.query(sql, [codigo, password], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    if (result.length > 0) {

      res.json({
        success: true,
        user: result[0]
      });

    } else {

      res.json({
        success: false
      });

    }

  });

});


// VER USUARIOS
app.get("/usuarios", (req, res) => {

  const sql = "SELECT * FROM usuarios";

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

});


// CREAR USUARIO
app.post("/usuarios", (req, res) => {

  const { 
    codigo,
    password,
    nombre,
    apellido,
    cedula,
    direccion,
    correo,
    telefono,
    rol,
    foto
  } = req.body;

  const sql = `
  INSERT INTO usuarios 
  (codigo,password,nombre,apellido,cedula,direccion,correo,telefono,rol,foto)
  VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(sql,
  [
    codigo,
    password,
    nombre,
    apellido,
    cedula,
    direccion,
    correo,
    telefono,
    rol,
    foto
  ],
  (err,result)=>{

    if(err){
      return res.status(500).json(err)
    }

    res.json({success:true})

  })

});


// EDITAR USUARIO
app.put("/usuarios/:id",(req,res)=>{

const { id } = req.params

const { nombre, apellido, direccion, correo, telefono } = req.body

const sql = `
UPDATE usuarios
SET nombre=?, apellido=?, direccion=?, correo=?, telefono=?
WHERE id=?
`

db.query(sql,[nombre,apellido,direccion,correo,telefono,id],(err,result)=>{

if(err){
return res.status(500).json(err)
}

res.json({success:true})

})

})


// ELIMINAR USUARIO
app.delete("/usuarios/:id",(req,res)=>{

const { id } = req.params

const sql = "DELETE FROM usuarios WHERE id=?"

db.query(sql,[id],(err,result)=>{

if(err){
return res.status(500).json(err)
}

res.json({success:true})

})

})


app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

// ================= INVENTARIOS =================

//  OBTENER PRODUCTOS POR CATEGORIA
app.get("/productos/:id_categoria", (req, res) => {

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

});


//  OBTENER PRODUCTO POR ID
app.get("/producto/:id", (req, res) => {

  const { id } = req.params;

  const sql = "SELECT * FROM productos WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });

});

//  OBTENER PRODUCTO EN GENERAL

app.get("/buscar-productos", (req, res) => {

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

});

app.get("/menu/:categoria_id", (req, res) => {

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

});

app.get("/menu-item/:menu_id/ingredientes", (req, res) => {

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

});

app.post("/categorias", (req, res) => {

  const { nombre, imagen } = req.body;

  const sql = "INSERT INTO categorias (nombre, imagen) VALUES (?,?)";

  db.query(sql, [nombre, imagen], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json({ success: true });

  });

});

//  CREAR PRODUCTO
app.post("/productos", (req, res) => {

  const { nombre, precio, cantidad, imagen, categoria } = req.body;

  if (!nombre || !precio || !cantidad || !categoria) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // 1. Buscar id de categoria por nombre
  const sqlCategoria = "SELECT id FROM categorias WHERE nombre = ?";

  db.query(sqlCategoria, [categoria], (err, resultCat) => {

    if (err) return res.status(500).json(err);

    if (resultCat.length === 0) {
      return res.status(400).json({ error: "Categoría no existe" });
    }

    const categoria_id = resultCat[0].id;

    // 2. Insertar producto
    const sqlProducto = `
      INSERT INTO productos (nombre, precio, cantidad, imagen)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sqlProducto, [nombre, precio, cantidad, imagen], (err, result) => {

      if (err) return res.status(500).json(err);

      const productoId = result.insertId;

      // 3. Relación
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

});


//  ACTUALIZAR PRODUCTO
app.put("/productos/:id", (req, res) => {

  const { id } = req.params;
  const { nombre, precio, cantidad, imagen } = req.body;

  const sql = `
    UPDATE productos
    SET nombre=?, precio=?, cantidad=?, imagen=?
    WHERE id=?
  `;

  db.query(sql, [nombre, precio, cantidad, imagen, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

});


//  ELIMINAR PRODUCTO
app.delete("/productos/:id", (req, res) => {

  const { id } = req.params;

  // Primero borrar relación (BUENA PRÁCTICA)
  db.query("DELETE FROM producto_categoria WHERE producto_id=?", [id]);

  db.query("DELETE FROM productos WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

});


// ================= CATEGORIAS =================

app.get("/categorias", (req, res) => {

  db.query("SELECT * FROM categorias", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});


app.post("/categorias", (req, res) => {

  const { nombre, imagen } = req.body;

  db.query(
    "INSERT INTO categorias (nombre, imagen) VALUES (?,?)",
    [nombre, imagen],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );

});



// ================= MOVIMIENTOS =================

app.post('/movimientos', (req, res) => {

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

});


app.get('/movimientos/:producto_id', (req, res) => {

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

});

// ================= MENU =================

app.get('/menu', (req, res) => {
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
})

// ================= FIN INVENTARIO =================
