const express = require("express");
const router = express.Router();
const { dbPromise } = require("../db");

router.get("/api/productos-menu/productos", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT
        m.id,
        m.nombre,
        m.descripcion,
        m.precio,
        m.imagen,
        c.nombre AS categoria
      FROM menu m
      LEFT JOIN categorias c ON m.categoria_id = c.id
      ORDER BY m.nombre ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en productos del menu" });
  }
});

router.get("/api/productos-menu/historico", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(`
      SELECT
        COALESCE(m.nombre, pd.nombre_menu_snapshot) AS producto,
        DATE(pe.fecha_creacion) AS fecha,
        SUM(pd.cantidad) AS consumo_dia
      FROM pedido_detalles pd
      JOIN pedidos pe ON pd.pedido_id = pe.id
      LEFT JOIN menu m ON pd.menu_id = m.id
      GROUP BY COALESCE(m.nombre, pd.nombre_menu_snapshot), DATE(pe.fecha_creacion)
      ORDER BY fecha ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en historico de productos del menu" });
  }
});

module.exports = router;
