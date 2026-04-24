const express = require("express");
const router = express.Router();
const controller = require("../controllers/alertasController");

router.get("/alertas-stock", controller.getAlertasStock);

module.exports = router;