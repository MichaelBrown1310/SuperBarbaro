const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt')

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "superbarbaro"
});
const dbPromise = db.promise();

const generarNumeroPedido = () => {
  return `PED-${Date.now()}`;
};

const construirReciboTexto = (pedido) => {
  const encabezado = [
    `Pedido ${pedido.numero_pedido}`,
    `Cliente: ${pedido.cliente_nombre || 'Sin nombre'}`,
    `Telefono: ${pedido.cliente_telefono || 'Sin telefono'}`,
    `Servicio: ${pedido.tipo_servicio}`,
    `Estado: ${pedido.estado}`,
    `Total: ${pedido.total}`
  ];

  const detalle = pedido.items.flatMap((item, index) => {
    const lineas = [
      `${index + 1}. ${item.nombre} x${item.cantidad} - ${item.subtotal_final}`
    ];

    item.adiciones.forEach((adicion) => {
      lineas.push(`   + ${adicion.nombre} x${adicion.cantidad_total} - ${adicion.subtotal}`);
    });

    item.remociones.forEach((remocion) => {
      lineas.push(`   - Sin ${remocion.nombre}`);
    });

    return lineas;
  });

  return [...encabezado, ...detalle].join('\n');
};

const normalizarItemsPedido = (items = []) => {
  return items.map((item) => {
    const precioUnitario = Number(item.precio_unitario || 0);
    const cantidad = Number(item.cantidad || 0);
    const subtotalBase = precioUnitario * cantidad;

    const adiciones = Array.isArray(item.adiciones)
      ? item.adiciones.map((adicion) => {
        const precio = Number(adicion.precio_unitario || 0);
        const cantidadPorUnidad = Number(adicion.cantidad_por_unidad || 0);
        const cantidadTotal = cantidad * cantidadPorUnidad;

        return {
          ...adicion,
          precio_unitario: precio,
          cantidad_por_unidad: cantidadPorUnidad,
          cantidad_total: cantidadTotal,
          subtotal: precio * cantidadTotal
        };
      })
      : [];

    const remociones = Array.isArray(item.remociones) ? item.remociones : [];
    const subtotalAdiciones = adiciones.reduce((acc, adicion) => acc + adicion.subtotal, 0);

    return {
      ...item,
      precio_unitario: precioUnitario,
      cantidad,
      subtotal_base: subtotalBase,
      subtotal_adiciones: subtotalAdiciones,
      subtotal_final: subtotalBase + subtotalAdiciones,
      adiciones,
      remociones
    };
  });
};

const construirResumenPedido = ({
  numeroPedido,
  clienteNombre,
  clienteTelefono,
  tipoServicio,
  estado,
  itemsNormalizados
}) => {
  const subtotal = itemsNormalizados.reduce((acc, item) => acc + item.subtotal_base, 0);
  const totalAdiciones = itemsNormalizados.reduce((acc, item) => acc + item.subtotal_adiciones, 0);
  const total = subtotal + totalAdiciones;

  const reciboJson = JSON.stringify({
    numero_pedido: numeroPedido,
    cliente_nombre: clienteNombre || '',
    cliente_telefono: clienteTelefono || '',
    tipo_servicio: tipoServicio,
    estado,
    subtotal,
    total_adiciones: totalAdiciones,
    total,
    items: itemsNormalizados
  });

  const reciboTexto = construirReciboTexto({
    numero_pedido: numeroPedido,
    cliente_nombre: clienteNombre,
    cliente_telefono: clienteTelefono,
    tipo_servicio: tipoServicio,
    estado,
    total,
    items: itemsNormalizados
  });

  return {
    subtotal,
    totalAdiciones,
    total,
    reciboJson,
    reciboTexto
  };
};

const guardarDetallesPedido = async (pedidoId, itemsNormalizados) => {
  for (const item of itemsNormalizados) {
    const [detalleResult] = await dbPromise.query(
      `INSERT INTO pedido_detalles
      (pedido_id, menu_id, nombre_menu_snapshot, precio_unitario, cantidad, subtotal_base, subtotal_adiciones, subtotal_final)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pedidoId,
        item.menu_id,
        item.nombre_menu_snapshot,
        item.precio_unitario,
        item.cantidad,
        item.subtotal_base,
        item.subtotal_adiciones,
        item.subtotal_final
      ]
    );

    const detalleId = detalleResult.insertId;

    for (const adicion of item.adiciones) {
      await dbPromise.query(
        `INSERT INTO pedido_detalle_adiciones
        (pedido_detalle_id, producto_id, nombre_producto_snapshot, precio_unitario, cantidad_por_unidad, cantidad_total, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          detalleId,
          adicion.producto_id,
          adicion.nombre_producto_snapshot,
          adicion.precio_unitario,
          adicion.cantidad_por_unidad,
          adicion.cantidad_total,
          adicion.subtotal
        ]
      );
    }

    for (const remocion of item.remociones) {
      await dbPromise.query(
        `INSERT INTO pedido_detalle_remociones
        (pedido_detalle_id, producto_id, nombre_producto_snapshot)
        VALUES (?, ?, ?)`,
        [
          detalleId,
          remocion.producto_id,
          remocion.nombre_producto_snapshot
        ]
      );
    }
  }
};

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
app.post("/usuarios", async (req, res) => {

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

        res.json({ success: true })

      })

  } catch (error) {
    res.status(500).json(error)
  }

})


// EDITAR USUARIO
app.put("/usuarios/:id", (req, res) => {

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

    res.json({ success: true })

  })

})


// ELIMINAR USUARIO
app.delete("/usuarios/:id", (req, res) => {

  const { id } = req.params

  const sql = "DELETE FROM usuarios WHERE id=?"

  db.query(sql, [id], (err, result) => {

    if (err) {
      return res.status(500).json(err)
    }

    res.json({ success: true })

  })

})


app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

// ================= INVENTARIOS =================

//  OBTENER PRODUCTOS POR CATEGORIA
app.get("/productos/:id_categoria", (req, res) => {

  const { id_categoria } = req.params;

  const sql = `
    SELECT p.*
    FROM productos p
    JOIN producto_categoria pc ON p.id = pc.producto_id
    WHERE pc.categoria_id = ?
  `;

  db.query(sql, [id_categoria], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });

});


//  OBTENER PRODUCTO POR ID
app.get("/producto/:id", (req, res) => {

  const { id } = req.params;

  const sql = "SELECT * FROM productos WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });

});

//  OBTENER PRODUCTO EN GENERAL

app.get("/buscar-productos", (req, res) => {

  const { q } = req.query;

  const sql = `
    SELECT p.*
    FROM productos p
    WHERE p.nombre LIKE ?
  `;

  db.query(sql, [`%${q}%`], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

});

app.get("/menu/:categoria_id", (req, res) => {

  const { categoria_id } = req.params;

  const sql = `
    SELECT *
    FROM menu
    WHERE categoria_id = ?
    ORDER BY nombre ASC
  `;

  db.query(sql, [categoria_id], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

});

app.get("/menu-item/:menu_id/ingredientes", (req, res) => {

  const { menu_id } = req.params;

  const sql = `
    SELECT
      p.id,
      p.nombre,
      p.precio,
      p.imagen,
      mp.cantidad AS cantidad_base
    FROM menu_productos mp
    JOIN productos p ON p.id = mp.producto_id
    WHERE mp.menu_id = ?
    ORDER BY p.nombre ASC
  `;

  db.query(sql, [menu_id], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

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

//  CREAR PRODUCTO
app.post("/productos", (req, res) => {

  const { nombre, precio, cantidad, imagen, categoria, minimo } = req.body;

  if (!nombre || !precio || !cantidad || !categoria) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // 1. Buscar id de categoria por nombre
  const sqlCategoria = "SELECT id FROM categorias WHERE nombre = ?";

  db.query(sqlCategoria, [categoria], (err, resultCat) => {

    if (err) return res.status(500).json(err);

    if (resultCat.length === 0) {
      return res.status(400).json({ error: "Categoría no existe" });
    }

    const categoria_id = resultCat[0].id;

    // 2. Insertar producto
    const sqlProducto = `
      INSERT INTO productos (nombre, precio, cantidad, imagen, minimo)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sqlProducto, [nombre, precio, cantidad, imagen, minimo || 10], (err, result) => {

      if (err) return res.status(500).json(err);

      const productoId = result.insertId;

      // 3. Relación
      const sqlRelacion = `
        INSERT INTO producto_categoria (producto_id, categoria_id)
        VALUES (?, ?)
      `;

      db.query(sqlRelacion, [productoId, categoria_id], (err2) => {

        if (err2) return res.status(500).json(err2);

        res.json({ success: true });

      });

    });

  });

});


//  ACTUALIZAR PRODUCTO
app.put("/productos/:id", (req, res) => {

  const { id } = req.params;
  const { nombre, precio, cantidad, imagen, minimo } = req.body;

  const sql = `
    UPDATE productos
    SET nombre=?, precio=?, cantidad=?, imagen=?, minimo=?
    WHERE id=?
  `;

  db.query(sql, [nombre, precio, cantidad, imagen, minimo, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

});

//  ELIMINAR PRODUCTO
app.delete("/productos/:id", (req, res) => {

  const { id } = req.params;

  // Primero borrar relación (BUENA PRÁCTICA)
  db.query("DELETE FROM producto_categoria WHERE producto_id=?", [id]);

  db.query("DELETE FROM productos WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });

});


// ================= CATEGORIAS =================

app.get("/categorias", (req, res) => {

  db.query("SELECT * FROM categorias", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});


app.post("/categorias", (req, res) => {

  const { nombre, imagen } = req.body;

  db.query(
    "INSERT INTO categorias (nombre, imagen) VALUES (?,?)",
    [nombre, imagen],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );

});



// ================= MOVIMIENTOS =================

app.post('/movimientos', (req, res) => {

  const { producto_id, tipo, cantidad, motivo } = req.body;

  db.query(
    `INSERT INTO movimientos_productos 
     (producto_id, tipo, cantidad, motivo) 
     VALUES (?, ?, ?, ?)`,
    [producto_id, tipo, cantidad, motivo],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ mensaje: "Movimiento guardado" });
    }
  );

});


app.get('/movimientos/:producto_id', (req, res) => {

  const { producto_id } = req.params;

  db.query(
    `SELECT * FROM movimientos_productos 
     WHERE producto_id = ?
     ORDER BY fecha DESC`,
    [producto_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );

});

// ================= MENU =================

app.get('/menu', (req, res) => {
  const sql = `
    SELECT 
      menu.*, 
      categorias.nombre AS categoria_nombre
    FROM menu
    LEFT JOIN categorias 
      ON menu.categoria_id = categorias.id
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error en el servidor' })
    }

    res.json(results)
  })
})

// ================= PEDIDOS =================

app.post('/pedidos', async (req, res) => {
  const {
    cliente_nombre,
    cliente_telefono,
    tipo_servicio,
    items
  } = req.body;

  if (!tipo_servicio) {
    return res.status(400).json({ error: 'El tipo de servicio es obligatorio' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debes enviar al menos un item en el pedido' });
  }

  const numeroPedido = generarNumeroPedido();
  const estado = 'pendiente';

  const itemsNormalizados = normalizarItemsPedido(items);
  const { subtotal, totalAdiciones, total, reciboJson, reciboTexto } = construirResumenPedido({
    numeroPedido,
    clienteNombre: cliente_nombre,
    clienteTelefono: cliente_telefono,
    tipoServicio: tipo_servicio,
    estado,
    itemsNormalizados
  });

  try {
    await dbPromise.beginTransaction();

    const [pedidoResult] = await dbPromise.query(
      `INSERT INTO pedidos
      (numero_pedido, cliente_nombre, cliente_telefono, tipo_servicio, estado, subtotal, total_adiciones, total, recibo_json, recibo_texto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numeroPedido,
        cliente_nombre || null,
        cliente_telefono || null,
        tipo_servicio,
        estado,
        subtotal,
        totalAdiciones,
        total,
        reciboJson,
        reciboTexto
      ]
    );

    const pedidoId = pedidoResult.insertId;

    await guardarDetallesPedido(pedidoId, itemsNormalizados);

    await dbPromise.commit();

    res.json({
      success: true,
      pedido_id: pedidoId,
      numero_pedido: numeroPedido
    });
  } catch (error) {
    await dbPromise.rollback();
    console.log('Error guardando pedido:', error);
    res.status(500).json({ error: 'No se pudo guardar el pedido' });
  }
});

app.get('/pedidos', async (req, res) => {
  const { fecha, hoy } = req.query;

  let sql = `
    SELECT
      id,
      numero_pedido,
      cliente_nombre,
      cliente_telefono,
      tipo_servicio,
      estado,
      total,
      fecha_creacion
    FROM pedidos
  `;

  let params = [];

  // FILTRO POR FECHA ESPECÍFICA
  if (fecha) {
    sql += ` WHERE DATE(fecha_creacion) = ?`;
    params.push(fecha);
  }

  // FILTRO DIA ACTUAL
  if (hoy === 'true') {
    sql += ` WHERE DATE(fecha_creacion) = CURDATE()`;
  }

  sql += ` ORDER BY fecha_creacion DESC`;

  try {
    const [pedidos] = await dbPromise.query(sql, params);
    res.json(pedidos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error consultando pedidos' });
  }
});


app.get('/pedidos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [pedidos] = await dbPromise.query(
      `SELECT
        id,
        numero_pedido,
        cliente_nombre,
        cliente_telefono,
        tipo_servicio,
        estado,
        subtotal,
        total_adiciones,
        total,
        recibo_json,
        recibo_texto,
        fecha_creacion
      FROM pedidos
      WHERE id = ?`,
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = pedidos[0];
    const recibo = pedido.recibo_json ? JSON.parse(pedido.recibo_json) : null;

    res.json({
      ...pedido,
      items: recibo?.items || []
    });
  } catch (error) {
    console.log('Error consultando detalle del pedido:', error);
    res.status(500).json({ error: 'No se pudo consultar el pedido' });
  }
});

app.put('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    cliente_nombre,
    cliente_telefono,
    tipo_servicio,
    items
  } = req.body;

  if (!tipo_servicio) {
    return res.status(400).json({ error: 'El tipo de servicio es obligatorio' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debes enviar al menos un item en el pedido' });
  }

  try {
    const [pedidos] = await dbPromise.query(
      'SELECT id, numero_pedido, estado FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedidoActual = pedidos[0];

    if (pedidoActual.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden editar pedidos pendientes' });
    }

    const itemsNormalizados = normalizarItemsPedido(items);
    const { subtotal, totalAdiciones, total, reciboJson, reciboTexto } = construirResumenPedido({
      numeroPedido: pedidoActual.numero_pedido,
      clienteNombre: cliente_nombre,
      clienteTelefono: cliente_telefono,
      tipoServicio: tipo_servicio,
      estado: pedidoActual.estado,
      itemsNormalizados
    });

    await dbPromise.beginTransaction();

    await dbPromise.query(
      `UPDATE pedidos
      SET cliente_nombre = ?, cliente_telefono = ?, tipo_servicio = ?, subtotal = ?, total_adiciones = ?, total = ?, recibo_json = ?, recibo_texto = ?
      WHERE id = ?`,
      [
        cliente_nombre || null,
        cliente_telefono || null,
        tipo_servicio,
        subtotal,
        totalAdiciones,
        total,
        reciboJson,
        reciboTexto,
        id
      ]
    );

    await dbPromise.query('DELETE FROM pedido_detalles WHERE pedido_id = ?', [id]);
    await guardarDetallesPedido(id, itemsNormalizados);

    await dbPromise.commit();

    res.json({ success: true, pedido_id: Number(id) });
  } catch (error) {
    await dbPromise.rollback();
    console.log('Error actualizando pedido:', error);
    res.status(500).json({ error: 'No se pudo actualizar el pedido' });
  }
});

app.patch('/pedidos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ['pendiente', 'en_preparacion', 'completado', 'cancelado'];

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no permitido' });
  }

  const conn = dbPromise;

  try {
    await conn.beginTransaction();

    // obtener pedido actual
    const [pedidos] = await conn.query(
      'SELECT id, estado FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedidos.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const estadoAnterior = pedidos[0].estado;

    // VALIDACIONES DE FLUJO
    if (estado === 'en_preparacion' && estadoAnterior !== 'pendiente') {
      await conn.rollback();
      return res.status(400).json({ error: 'Solo pedidos pendientes pueden iniciar' });
    }

    if (estado === 'completado' && estadoAnterior !== 'en_preparacion') {
      await conn.rollback();
      return res.status(400).json({ error: 'Solo pedidos en preparación pueden completarse' });
    }

    if (estado === 'cancelado' && estadoAnterior !== 'pendiente') {
      await conn.rollback();
      return res.status(400).json({ error: 'Solo pedidos pendientes pueden cancelarse' });
    }

    // SOLO DESCONTAR SI PASA A "en_preparacion"
    if (estado === 'en_preparacion' && estadoAnterior !== 'en_preparacion') {

      // 1. obtener detalles del pedido
      const [detalles] = await conn.query(
        'SELECT id, menu_id, cantidad FROM pedido_detalles WHERE pedido_id = ?',
        [id]
      );

      for (const detalle of detalles) {

        // 2. obtener productos del menú
        const [productosMenu] = await conn.query(
          'SELECT producto_id, cantidad FROM menu_productos WHERE menu_id = ?',
          [detalle.menu_id]
        );

        for (const prod of productosMenu) {

          const cantidadDescontar = prod.cantidad * detalle.cantidad;

          // 3. descontar inventario
          await conn.query(
            'UPDATE productos SET cantidad = cantidad - ? WHERE id = ?',
            [cantidadDescontar, prod.producto_id]
          );

          // 4. registrar movimiento
          await conn.query(
            `INSERT INTO movimientos_productos 
             (producto_id, tipo, cantidad, motivo, fecha)
             VALUES (?, 'salida', ?, ?, NOW())`,
            [
              prod.producto_id,
              cantidadDescontar,
              `Pedido #${id}`
            ]
          );
        }

        // 5. ADICIONES
        const [adiciones] = await conn.query(
          'SELECT producto_id, cantidad_total FROM pedido_detalle_adiciones WHERE pedido_detalle_id = ?',
          [detalle.id]
        );

        for (const ad of adiciones) {

          await conn.query(
            'UPDATE productos SET cantidad = cantidad - ? WHERE id = ?',
            [ad.cantidad_total, ad.producto_id]
          );

          await conn.query(
            `INSERT INTO movimientos_productos 
             (producto_id, tipo, cantidad, motivo, fecha)
             VALUES (?, 'salida', ?, ?, NOW())`,
            [
              ad.producto_id,
              ad.cantidad_total,
              `Adición pedido #${id}`
            ]
          );
        }
      }
    }

    // actualizar estado
    await conn.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id]
    );

    await conn.commit();

    res.json({ success: true, estado });

  } catch (error) {
    await conn.rollback();
    console.log('Error:', error);
    res.status(500).json({ error: 'Error al procesar pedido' });
  }
});

// ================= FIN INVENTARIO =================

// ============== ALERTAS =================

app.get("/alertas-stock", (req, res) => {

  const sql = `
    SELECT *
    FROM productos
    WHERE cantidad <= minimo
  `;

  db.query(sql, (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

});
