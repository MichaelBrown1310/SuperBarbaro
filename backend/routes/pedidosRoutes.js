const express = require("express");
const router = express.Router();
const controller = require("../controllers/pedidosController");

router.post('/pedidos', controller.createPedido);
router.get('/pedidos', controller.getPedidos);
router.get('/pedidos/:id', controller.getPedidoById);
router.put('/pedidos/:id', controller.updatePedido);
router.patch('/pedidos/:id/estado', controller.updateEstadoPedido);

module.exports = router;