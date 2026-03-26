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

//INVENTARIOS
app.get("/productos/:id_categoria", (req, res) => {

  const { id_categoria } = req.params;

  const sql = `
    SELECT p.*
    FROM productos p
    JOIN producto_categoria pc ON p.id = pc.producto_id
    WHERE pc.categoria_id = ?
  `;

  db.query(sql, [id_categoria], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

});


app.get("/producto/:id", (req, res) => {

  const { id } = req.params;

  const sql = "SELECT * FROM productos WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });

});

app.post("/productos", (req, res) => {

  const { nombre, precio, cantidad, imagen, categorias } = req.body;

  // categorias = [11, 12] (array)

  const sqlProducto = `
    INSERT INTO productos (nombre, precio, cantidad, imagen)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sqlProducto, [nombre, precio, cantidad, imagen], (err, result) => {

    if (err) return res.status(500).json(err);

    const producto_id = result.insertId;

    // insertar relaciones
    const valores = categorias.map(cat_id => [producto_id, cat_id]);

    const sqlRelacion = `
      INSERT INTO producto_categoria (producto_id, categoria_id)
      VALUES ?
    `;

    db.query(sqlRelacion, [valores], (err2) => {

      if (err2) return res.status(500).json(err2);

      res.json({ success: true });

    });

  });

});

app.put("/productos/:id", (req, res) => {

  const { id } = req.params;
  const { nombre, precio, cantidad, imagen } = req.body;

  const sql = `
  UPDATE productos
  SET nombre=?, precio=?, cantidad=?, imagen=?
  WHERE id=?
  `;

  db.query(sql, [nombre, precio, cantidad, imagen, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

});

app.delete("/productos/:id", (req, res) => {

  const { id } = req.params;

  const sql = "DELETE FROM productos WHERE id=?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

});

app.get("/categorias", (req, res) => {

  const sql = "SELECT * FROM categorias";

  db.query(sql, (err, result) => {

    if (err) return res.status(500).json(err);

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

app.post("/productos", (req, res) => {

  const { nombre, precio, cantidad, imagen, categoria } = req.body;

  if (!nombre || !precio || !cantidad || !categoria) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = `
    INSERT INTO productos (nombre, precio, cantidad, imagen, categoria)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nombre, precio, cantidad, imagen, categoria], (err, result) => {

    if (err) {
      console.log("Error SQL:", err);
      return res.status(500).json(err);
    }

    res.json({ success: true });

  });

});

app.post('/movimientos', async (req, res) => {
  const { producto_id, tipo, cantidad, motivo } = req.body

  await db.query(
    `INSERT INTO movimientos_productos 
     (producto_id, tipo, cantidad, motivo) 
     VALUES (?, ?, ?, ?)`,
    [producto_id, tipo, cantidad, motivo]
  )

  res.json({ mensaje: "Movimiento guardado" })
})

app.get('/movimientos/:producto_id', (req, res) => {
  const { producto_id } = req.params

  db.query(
    `SELECT * FROM movimientos_productos 
     WHERE producto_id = ?
     ORDER BY fecha DESC`,
    [producto_id],
    (err, results) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: err })
      }

      res.json(results)
    }
  )
})






//CIERRA INVENTARIOS
