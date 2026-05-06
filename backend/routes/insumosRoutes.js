const express = require("express");
const router = express.Router();
const { dbPromise } = require("../db");

// 1. CONSUMO TOTAL DE INSUMOS
router.get("/api/insumos/consumo", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT 
        p.nombre AS insumo,
        SUM(pd.cantidad * mp.cantidad) AS total
      FROM pedido_detalles pd
      JOIN menu_productos mp ON pd.menu_id = mp.menu_id
      JOIN productos p ON mp.producto_id = p.id
      GROUP BY p.id
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en consumo" });
  }
});


// 2. HISTÓRICO (para predicción)
router.get("/api/insumos/historico", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT 
        p.nombre AS insumo,
        DATE(pe.fecha_creacion) as fecha,
        SUM(pd.cantidad * mp.cantidad) AS consumo_dia
      FROM pedido_detalles pd
      JOIN pedidos pe ON pd.pedido_id = pe.id
      JOIN menu_productos mp ON pd.menu_id = mp.menu_id
      JOIN productos p ON mp.producto_id = p.id
      GROUP BY p.id, DATE(pe.fecha_creacion)
      ORDER BY fecha
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en historico" });
  }
});


// 3. PRODUCTOS (para alertas)
router.get("/api/insumos/productos", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT id, nombre, cantidad, minimo
      FROM productos
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en productos" });
  }
});

module.exports = router;