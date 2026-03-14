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
