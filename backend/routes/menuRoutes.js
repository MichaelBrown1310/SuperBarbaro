const express = require("express");
const router = express.Router();
const controller = require("../controllers/menuController");

router.get('/menu', controller.getMenu);
router.get('/menu/:categoria_id', controller.getMenuPorCategoria);
router.get('/menu-id/:id', controller.getMenuById);
router.get('/menu-item/:menu_id/ingredientes', controller.getIngredientes);

router.post('/menu', controller.upload.single('imagen'), controller.createMenu);
router.put('/menu/:id', controller.upload.single('imagen'), controller.updateMenu);

module.exports = router;