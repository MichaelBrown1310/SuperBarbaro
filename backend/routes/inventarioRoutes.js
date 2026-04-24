const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventarioController");

router.get("/productos/:id_categoria", controller.getProductosPorCategoria);
router.get("/producto/:id", controller.getProductoById);
router.get("/buscar-productos", controller.buscarProductos);

router.get("/categorias", controller.getCategorias);
router.post("/categorias", controller.createCategoria);

router.post("/productos", controller.createProducto);
router.put("/productos/:id", controller.updateProducto);
router.delete("/productos/:id", controller.deleteProducto);

router.post('/movimientos', controller.createMovimiento);
router.get('/movimientos/:producto_id', controller.getMovimientos);

module.exports = router;