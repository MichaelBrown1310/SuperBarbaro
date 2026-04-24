const { dbPromise } = require("../db");
const {
  generarNumeroPedido,
  normalizarItemsPedido,
  construirResumenPedido,
  guardarDetallesPedido
} = require("../models/helpers");

let io;

exports.setIO = (ioInstance) => {
  io = ioInstance;
};

exports.createPedido = async (req, res) => {
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

    io.emit('pedidos:actualizados');
    io.emit('pedido:detalle-actualizado', { id: pedidoId });

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
};

exports.getPedidos = async (req, res) => {
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

  if (fecha) {
    sql += ` WHERE DATE(fecha_creacion) = ?`;
    params.push(fecha);
  }

  if (hoy === 'true') {
    sql += ` WHERE DATE(fecha_creacion) = CURDATE()`;
  }

  sql += ` ORDER BY fecha_creacion DESC`;

  try {
    const [pedidos] = await dbPromise.query(sql, params);
    console.log('PEDIDOS DESDE BACK:', pedidos);
    res.json(pedidos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error consultando pedidos' });
  }
};

exports.getPedidoById = async (req, res) => {
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
};

exports.updatePedido = async (req, res) => {
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

    io.emit('pedidos:actualizados');
    io.emit('pedido:detalle-actualizado', { id: Number(id) });

    res.json({ success: true, pedido_id: Number(id) });
  } catch (error) {
    await dbPromise.rollback();
    console.log('Error actualizando pedido:', error);
    res.status(500).json({ error: 'No se pudo actualizar el pedido' });
  }
};

exports.updateEstadoPedido = async (req, res) => {
  const { id } = req.params;
  let { estado } = req.body;

  const estadosPermitidos = ['pendiente', 'en_preparacion', 'completado', 'cancelado'];

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no permitido' });
  }

  const conn = dbPromise;

  try {
    await conn.beginTransaction();

    const [pedidos] = await conn.query(
      'SELECT id, estado FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedidos.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    let estadoAnterior = pedidos[0].estado;
    estadoAnterior = estadoAnterior?.trim().toLowerCase();

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

    if (estado === 'en_preparacion' && estadoAnterior !== 'en_preparacion') {

      const [detalles] = await conn.query(
        'SELECT id, menu_id, cantidad FROM pedido_detalles WHERE pedido_id = ?',
        [id]
      );

      for (const detalle of detalles) {

        const [productosMenu] = await conn.query(
          'SELECT producto_id, cantidad FROM menu_productos WHERE menu_id = ?',
          [detalle.menu_id]
        );

        for (const prod of productosMenu) {

          const cantidadDescontar = prod.cantidad * detalle.cantidad;

          await conn.query(
            'UPDATE productos SET cantidad = cantidad - ? WHERE id = ?',
            [cantidadDescontar, prod.producto_id]
          );

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

    await conn.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id]
    );

    await conn.commit();

    io.emit('pedidos:actualizados');
    io.emit('pedido:detalle-actualizado', { id: Number(id), estado });

    res.json({ success: true, estado });

  } catch (error) {
    await conn.rollback();
    console.log('Error:', error);
    res.status(500).json({ error: 'Error al procesar pedido' });
  }
};