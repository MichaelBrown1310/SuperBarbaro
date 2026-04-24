const express = require("express");
const router = express.Router();
const controller = require("../controllers/usuariosController");

router.post("/login", controller.login);
router.get("/usuarios", controller.getUsuarios);
router.post("/usuarios", controller.createUsuario);
router.put("/usuarios/:id", controller.updateUsuario);
router.delete("/usuarios/:id", controller.deleteUsuario);

module.exports = router;