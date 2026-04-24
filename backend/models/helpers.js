const { dbPromise } = require("../db");

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

module.exports = {
  generarNumeroPedido,
  construirReciboTexto,
  normalizarItemsPedido,
  construirResumenPedido,
  guardarDetallesPedido
};