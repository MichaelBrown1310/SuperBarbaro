const { db } = require("../db");
const bcrypt = require('bcrypt');

let io;

exports.setIO = (ioInstance) => {
  io = ioInstance;
};

exports.login = (req, res) => {

  const { codigo, password } = req.body;

  const sql = "SELECT * FROM usuarios WHERE codigo = ?";

  db.query(sql, [codigo], async (err, result) => {

    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.json({ success: false });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);

    if (match) {

      res.json({
        success: true,
        user
      });

    } else {

      res.json({
        success: false
      });

    }

  });

};

exports.getUsuarios = (req, res) => {

  const sql = "SELECT * FROM usuarios";

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};

exports.createUsuario = async (req, res) => {

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

  try {

    const hashedPassword = await bcrypt.hash(password, 10)

    const sql = `
    INSERT INTO usuarios 
    (codigo,password,nombre,apellido,cedula,direccion,correo,telefono,rol,foto)
    VALUES (?,?,?,?,?,?,?,?,?,?)
    `;

    db.query(sql,
      [
        codigo,
        hashedPassword,
        nombre,
        apellido,
        cedula,
        direccion,
        correo,
        telefono,
        rol,
        foto
      ],
      (err, result) => {

        if (err) {
          return res.status(500).json(err)
        }

        io.emit('usuarios:actualizados')

        res.json({ success: true })

      })

  } catch (error) {
    res.status(500).json(error)
  }

};

exports.updateUsuario = (req, res) => {

  const { id } = req.params

  const { nombre, apellido, direccion, correo, telefono } = req.body

  const sql = `
UPDATE usuarios
SET nombre=?, apellido=?, direccion=?, correo=?, telefono=?
WHERE id=?
`

  db.query(sql, [nombre, apellido, direccion, correo, telefono, id], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    io.emit('usuarios:actualizados')

    res.json({ success: true })

  })

};

exports.deleteUsuario = (req, res) => {

  const { id } = req.params

  const sql = "DELETE FROM usuarios WHERE id=?"

  db.query(sql, [id], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    io.emit('usuarios:actualizados')

    res.json({ success: true })

  })

};