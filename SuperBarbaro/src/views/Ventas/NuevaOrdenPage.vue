<template>
  <ion-page>
    <AppHeader :titulo="tituloPagina" />

    <ion-content class="fondo">
      <div class="contenedor-formulario">
        <input class="input" placeholder="Nombre" v-model="nombre" required :disabled="cargandoEdicion" />

        <!-- Selecciona el tipo de servicio (obligatorio) -->
        <select class="input" v-model="tipoServicio" required :disabled="cargandoEdicion">
          <option disabled value="">Seleccione tipo de servicio</option>
          <option value="llevar">Llevar</option>
          <option value="comer aqui">Comer aqui</option>
        </select>

        <input class="input" placeholder="Telefono" v-model="telefono" :disabled="cargandoEdicion" />
      </div>

      <div v-if="cargandoEdicion" class="estado-carga">Cargando pedido...</div>

      <div v-else class="layout-ventas">
        <section class="panel panel-categorias">
          <h2 class="titulo-seccion">Categorias</h2>

          <div class="lista-categorias">
            <button class="card-categoria" :class="{ activa: categoriaSeleccionada?.id === c.id }"
              v-for="c in categorias" :key="c.id" @click="seleccionarCategoria(c)">
              <img :src="c.imagen || 'https://via.placeholder.com/80'" :alt="c.nombre" />
              <span>{{ c.nombre }}</span>
            </button>
          </div>
        </section>

        <section class="panel panel-menu">
          <div class="encabezado-menu">
            <h2 class="titulo-seccion">
              {{ categoriaSeleccionada ? `Menu de ${categoriaSeleccionada.nombre}` : 'Menu' }}
            </h2>

            <input class="input buscador-menu" placeholder="Buscar en el menu..." v-model="busqueda" />
          </div>

          <div v-if="menuFiltrado.length === 0" class="estado-vacio">
            No hay platos del menu en esta categoria
          </div>

          <div v-else class="grid-productos">
            <div class="card-producto" v-for="item in menuFiltrado" :key="item.id">
              <img :src="item.imagen || 'https://via.placeholder.com/100'" :alt="item.nombre" />
              <p class="nombre-producto">{{ item.nombre }}</p>
              <p v-if="item.descripcion" class="descripcion-producto">{{ item.descripcion }}</p>
              <p class="precio-producto">${{ formatearPrecio(item.precio) }}</p>

              <div class="acciones-producto">
                <div class="contador">
                  <button class="btn-cantidad" @click="disminuirTemporal(item)">-</button>
                  <span>{{ cantidadesTemporales[item.id] || 1 }}</span>
                  <button class="btn-cantidad" @click="aumentarTemporal(item)">+</button>
                </div>

                <button class="btn-agregar" @click="agregarAlPedido(item)">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="panel panel-pedido">
          <h2 class="titulo-seccion">Pedido</h2>

          <div v-if="pedido.length === 0" class="estado-vacio">
            Aun no has agregado elementos
          </div>

          <div v-else class="lista-pedido">
            <div class="item-pedido"
              :class="{ 'item-pedido-personalizado': item.adiciones.length > 0 || item.remociones.length > 0 }"
              v-for="item in pedido" :key="item.lineaId">
              <div class="info-pedido">
                <p class="nombre-producto">{{ item.nombre }}</p>
                <p>${{ formatearPrecio(item.precio) }} c/u</p>
                <p>Subtotal base: ${{ formatearPrecio(item.precio * item.cantidad) }}</p>

                <div v-if="item.adiciones.length > 0" class="resumen-adiciones">
                  <p class="titulo-resumen-adiciones">Adiciones:</p>
                  <p v-for="adicion in item.adiciones" :key="`${item.lineaId}-ad-${adicion.id}`">
                    {{ adicion.nombre }} x{{ cantidadTotalAdicion(item, adicion) }} - ${{
                      formatearPrecio(totalAdicionLinea(item, adicion)) }}
                  </p>
                </div>

                <div v-if="item.remociones.length > 0" class="resumen-adiciones">
                  <p class="titulo-resumen-adiciones">Sin:</p>
                  <p v-for="ingrediente in item.remociones" :key="`${item.lineaId}-rm-${ingrediente.id}`">
                    {{ ingrediente.nombre }}
                  </p>
                </div>

                <p>Subtotal final: ${{ formatearPrecio(totalLinea(item)) }}</p>
              </div>

              <div class="controles-pedido">
                <div class="contador">
                  <button class="btn-cantidad" :class="{ 'btn-cantidad-eliminar': item.cantidad === 1 }"
                    @click="disminuirPedido(item.lineaId)">
                    -
                  </button>
                  <span>{{ item.cantidad }}</span>
                  <button class="btn-cantidad" @click="aumentarPedido(item.lineaId)">+</button>
                </div>

                <button class="btn-secundario" @click="toggleAdiciones(item.lineaId)">
                  {{ item.mostrarAdiciones ? 'Ocultar personalizacion' : 'Personalizar' }}
                </button>

                <button class="btn-eliminar" @click="toggleRemociones(item.lineaId)">
                  {{ item.mostrarRemociones ? 'Ocultar quitar' : 'Quitar' }}
                </button>

                <button class="btn-borrar-linea" @click="eliminarDelPedido(item.lineaId)">
                  Eliminar
                </button>
              </div>

              <div v-if="item.mostrarAdiciones" class="bloque-adiciones">
                <p class="subtitulo-adiciones">Adiciones permitidas de {{ nombreCategoriaPorId(item.categoria_id) }}</p>

                <div v-if="item.adiciones.length > 0" class="lista-adiciones-seleccionadas">
                  <p class="etiqueta-adiciones">Ya seleccionadas</p>

                  <div class="adicion-seleccionada" v-for="adicion in item.adiciones"
                    :key="`${item.lineaId}-sel-${adicion.id}`">
                    <div>
                      <p class="nombre-producto">{{ adicion.nombre }}</p>
                      <p>${{ formatearPrecio(adicion.precio) }} por unidad del elemento</p>
                    </div>

                    <div class="controles-pedido">
                      <div class="contador">
                        <button class="btn-cantidad" @click="disminuirAdicion(item.lineaId, adicion.id)">-</button>
                        <span>{{ adicion.cantidad }}</span>
                        <button class="btn-cantidad" @click="aumentarAdicion(item.lineaId, adicion.id)">+</button>
                      </div>

                      <button class="btn-eliminar" @click="eliminarAdicion(item.lineaId, adicion.id)">
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>

                <div class="lista-adiciones-disponibles">
                  <p class="etiqueta-adiciones">Disponibles</p>

                  <div v-if="adicionesNoSeleccionadas(item).length === 0" class="estado-vacio estado-adiciones">
                    No hay mas adiciones disponibles para esta categoria
                  </div>

                  <div class="adicion-disponible" v-for="adicion in adicionesNoSeleccionadas(item)"
                    :key="`${item.lineaId}-disp-${adicion.id}`">
                    <div>
                      <p class="nombre-producto">{{ adicion.nombre }}</p>
                      <p>${{ formatearPrecio(adicion.precio) }}</p>
                    </div>

                    <button class="btn-agregar btn-agregar-adicion" @click="agregarAdicion(item.lineaId, adicion)">
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="item.mostrarRemociones" class="bloque-adiciones">
                <p class="subtitulo-adiciones">Ingredientes que puedes quitar</p>

                <div class="lista-adiciones-seleccionadas bloque-remociones">
                  <div v-if="ingredientesNoRemovidos(item).length === 0" class="estado-vacio estado-adiciones">
                    No hay mas ingredientes para quitar en este elemento
                  </div>

                  <div class="adicion-disponible" v-for="ingrediente in ingredientesNoRemovidos(item)"
                    :key="`${item.lineaId}-ing-${ingrediente.id}`">
                    <div>
                      <p class="nombre-producto">{{ ingrediente.nombre }}</p>
                      <p>Ingrediente base del menu</p>
                    </div>

                    <button class="btn-eliminar btn-quitar-ingrediente"
                      @click="quitarIngrediente(item.lineaId, ingrediente)">
                      Quitar
                    </button>
                  </div>
                </div>

                <div v-if="item.remociones.length > 0" class="lista-adiciones-seleccionadas">
                  <p class="etiqueta-adiciones">Ingredientes quitados</p>

                  <div class="adicion-seleccionada" v-for="ingrediente in item.remociones"
                    :key="`${item.lineaId}-rest-${ingrediente.id}`">
                    <div>
                      <p class="nombre-producto">{{ ingrediente.nombre }}</p>
                      <p>Retirado del elemento</p>
                    </div>

                    <button class="btn-secundario" @click="restaurarIngrediente(item.lineaId, ingrediente.id)">
                      Restaurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="resumen-total">
            <p>Items: {{ totalItems }}</p>
            <p class="total-final">Total: ${{ formatearPrecio(totalPedido) }}</p>

            <button class="boton-registrar" :disabled="guardandoPedido" @click="seleccion">
              {{ guardandoPedido ? 'GUARDANDO...' : botonContinuar }}
            </button>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const pedidoId = computed(() => route.query.pedidoId ? Number(route.query.pedidoId) : null)
const tituloPagina = computed(() => pedidoId.value ? 'EDITAR PEDIDO' : 'NUEVA ORDEN')
const botonContinuar = computed(() => pedidoId.value ? 'GUARDAR CAMBIOS' : 'CONTINUAR')
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
const puedeGestionarPedidos = computed(() => {
  const rol = (usuario?.rol || '').toString().trim().toUpperCase()
  return rol === 'ADMINISTRADOR' || rol === 'CAJERO'
})

const nombre = ref('')
const telefono = ref('')
const tipoServicio = ref('')
const categorias = ref([])
const categoriaSeleccionada = ref(null)
const menu = ref([])
const menuCompleto = ref([])
const busqueda = ref('')
const cantidadesTemporales = ref({})
const pedido = ref([])
const adicionesDisponibles = ref({})
const ingredientesBaseDisponibles = ref({})
const siguienteLineaId = ref(1)
const guardandoPedido = ref(false)
const cargandoEdicion = ref(false)

const cargarCategorias = async () => {
  const res = await fetch('http://localhost:3000/categorias')
  categorias.value = await res.json()

  if (categorias.value.length > 0 && !categoriaSeleccionada.value) {
    await seleccionarCategoria(categorias.value[0])
  }
}

const cargarMenuCompleto = async () => {
  const res = await fetch('http://localhost:3000/menu')
  menuCompleto.value = await res.json()
}

const seleccionarCategoria = async (categoria) => {
  categoriaSeleccionada.value = categoria
  busqueda.value = ''

  const res = await fetch(`http://localhost:3000/menu/${categoria.id}`)
  menu.value = await res.json()

  inicializarCantidades()
}

const cargarPedidoEdicion = async () => {
  if (!pedidoId.value) {
    return
  }

  cargandoEdicion.value = true

  try {
    const res = await fetch(`http://localhost:3000/pedidos/${pedidoId.value}`)
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'No se pudo cargar el pedido')
    }

    if (data.estado !== 'pendiente') {
      window.alert('Solo se pueden editar pedidos pendientes')
      router.push(`/detalle-pedido/${pedidoId.value}`)
      return
    }

    nombre.value = data.cliente_nombre || ''
    telefono.value = data.cliente_telefono || ''
    tipoServicio.value = data.tipo_servicio || 'llevar'

    pedido.value = data.items.map((item, index) => ({
      id: item.menu_id,
      nombre: item.nombre_menu_snapshot,
      precio: Number(item.precio_unitario),
      cantidad: Number(item.cantidad),
      categoria_id: buscarCategoriaMenu(item.menu_id),
      lineaId: index + 1,
      adiciones: (item.adiciones || []).map((adicion) => ({
        id: adicion.producto_id,
        nombre: adicion.nombre_producto_snapshot,
        precio: Number(adicion.precio_unitario),
        cantidad: Number(adicion.cantidad_por_unidad)
      })),
      remociones: (item.remociones || []).map((remocion) => ({
        id: remocion.producto_id,
        nombre: remocion.nombre_producto_snapshot
      })),
      mostrarAdiciones: false,
      mostrarRemociones: false
    }))

    siguienteLineaId.value = pedido.value.length + 1
  } catch (error) {
    console.error('Error cargando pedido para editar', error)
    window.alert('No se pudo cargar el pedido')
    router.push('/lista-pedidos')
  } finally {
    cargandoEdicion.value = false
  }
}

const buscarCategoriaMenu = (menuId) => {
  const itemEncontrado = menuCompleto.value.find((item) => item.id === menuId)
  return itemEncontrado?.categoria_id || categoriaSeleccionada.value?.id || null
}

const menuFiltrado = computed(() => {
  const texto = busqueda.value.toLowerCase()

  // si hay búsqueda → usar TODO el menú
  if (texto) {
    return menuCompleto.value.filter((item) =>
      item.nombre.toLowerCase().includes(texto)
    )
  }

  // si no hay búsqueda → usar categoría actual
  return menu.value
})

const totalItems = computed(() => pedido.value.reduce((acumulado, item) => acumulado + item.cantidad, 0))
const totalPedido = computed(() => pedido.value.reduce((acumulado, item) => acumulado + totalLinea(item), 0))

const inicializarCantidades = () => {
  const cantidades = {}
  menu.value.forEach((item) => {
    cantidades[item.id] = 1
  })
  cantidadesTemporales.value = cantidades
}

const aumentarTemporal = (item) => {
  cantidadesTemporales.value[item.id] = (cantidadesTemporales.value[item.id] || 1) + 1
}

const disminuirTemporal = (item) => {
  const actual = cantidadesTemporales.value[item.id] || 1
  cantidadesTemporales.value[item.id] = actual > 1 ? actual - 1 : 1
}

const agregarAlPedido = (item) => {
  const cantidadSeleccionada = cantidadesTemporales.value[item.id] || 1
  cargarAdicionesCategoria(item.categoria_id)
  cargarIngredientesMenu(item.id)

  pedido.value.push({
    ...item,
    precio: Number(item.precio),
    cantidad: cantidadSeleccionada,
    lineaId: siguienteLineaId.value,
    adiciones: [],
    remociones: [],
    mostrarAdiciones: false,
    mostrarRemociones: false
  })

  siguienteLineaId.value += 1
  cantidadesTemporales.value[item.id] = 1
}

const aumentarPedido = (lineaId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (item) item.cantidad += 1
}

const disminuirPedido = (lineaId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (!item) return
  if (item.cantidad > 1) {
    item.cantidad -= 1
    return
  }
  pedido.value = pedido.value.filter((pedidoItem) => pedidoItem.lineaId !== lineaId)
}

const eliminarDelPedido = (lineaId) => {
  pedido.value = pedido.value.filter((pedidoItem) => pedidoItem.lineaId !== lineaId)
}

const cargarAdicionesCategoria = async (categoriaId) => {
  if (adicionesDisponibles.value[categoriaId]) return
  try {
    const res = await fetch(`http://localhost:3000/productos/${categoriaId}`)
    const productosCategoria = await res.json()
    adicionesDisponibles.value = {
      ...adicionesDisponibles.value,
      [categoriaId]: productosCategoria.filter((producto) => !esPan(producto.nombre)).map((producto) => ({ ...producto, precio: Number(producto.precio) }))
    }
  } catch {
    adicionesDisponibles.value = { ...adicionesDisponibles.value, [categoriaId]: [] }
  }
}

const cargarIngredientesMenu = async (menuId) => {
  if (ingredientesBaseDisponibles.value[menuId]) return
  try {
    const res = await fetch(`http://localhost:3000/menu-item/${menuId}/ingredientes`)
    const ingredientes = await res.json()
    ingredientesBaseDisponibles.value = {
      ...ingredientesBaseDisponibles.value,
      [menuId]: ingredientes.map((ingrediente) => ({ ...ingrediente, precio: Number(ingrediente.precio) }))
    }
  } catch {
    ingredientesBaseDisponibles.value = { ...ingredientesBaseDisponibles.value, [menuId]: [] }
  }
}

const toggleAdiciones = (lineaId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (!item) return
  item.mostrarAdiciones = !item.mostrarAdiciones
  if (item.mostrarAdiciones) item.mostrarRemociones = false
  cargarAdicionesCategoria(item.categoria_id)
  cargarIngredientesMenu(item.id)
}

const toggleRemociones = (lineaId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (!item) return
  item.mostrarRemociones = !item.mostrarRemociones
  if (item.mostrarRemociones) item.mostrarAdiciones = false
  cargarIngredientesMenu(item.id)
}

const agregarAdicion = (lineaId, adicion) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (!item) return
  const existente = item.adiciones.find((itemAdicion) => itemAdicion.id === adicion.id)
  if (existente) {
    existente.cantidad += 1
    return
  }
  item.adiciones.push({ ...adicion, cantidad: 1 })
}

const aumentarAdicion = (lineaId, adicionId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  const adicion = item?.adiciones.find((itemAdicion) => itemAdicion.id === adicionId)
  if (adicion) adicion.cantidad += 1
}

const disminuirAdicion = (lineaId, adicionId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  const adicion = item?.adiciones.find((itemAdicion) => itemAdicion.id === adicionId)
  if (!item || !adicion) return
  if (adicion.cantidad > 1) {
    adicion.cantidad -= 1
    return
  }
  item.adiciones = item.adiciones.filter((itemAdicion) => itemAdicion.id !== adicionId)
}

const eliminarAdicion = (lineaId, adicionId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (!item) return
  item.adiciones = item.adiciones.filter((itemAdicion) => itemAdicion.id !== adicionId)
}

const quitarIngrediente = (lineaId, ingrediente) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (!item) return
  if (item.remociones.find((itemIngrediente) => itemIngrediente.id === ingrediente.id)) return
  item.remociones.push(ingrediente)
}

const restaurarIngrediente = (lineaId, ingredienteId) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.lineaId === lineaId)
  if (!item) return
  item.remociones = item.remociones.filter((ingrediente) => ingrediente.id !== ingredienteId)
}

const totalAdicionesItem = (item) => item.adiciones.reduce((acumulado, adicion) => acumulado + totalAdicionLinea(item, adicion), 0)
const totalLinea = (item) => (Number(item.precio) * item.cantidad) + totalAdicionesItem(item)
const cantidadTotalAdicion = (item, adicion) => item.cantidad * adicion.cantidad
const totalAdicionLinea = (item, adicion) => Number(adicion.precio) * cantidadTotalAdicion(item, adicion)
const adicionesNoSeleccionadas = (item) => (adicionesDisponibles.value[item.categoria_id] || []).filter((adicion) => !item.adiciones.map((a) => a.id).includes(adicion.id))
const ingredientesNoRemovidos = (item) => (ingredientesBaseDisponibles.value[item.id] || []).filter((ingrediente) => !item.remociones.map((r) => r.id).includes(ingrediente.id))
const nombreCategoriaPorId = (categoriaId) => categorias.value.find((categoria) => categoria.id === categoriaId)?.nombre || 'esta categoria'
const esPan = (nombreProducto) => nombreProducto?.toLowerCase().includes('pan')
const formatearPrecio = (valor) => Number(valor || 0).toLocaleString('es-CO')

const construirPayloadPedido = () => ({
  cliente_nombre: nombre.value.trim(),
  cliente_telefono: telefono.value.trim(),
  tipo_servicio: tipoServicio.value,
  items: pedido.value.map((item) => ({
    menu_id: item.id,
    nombre_menu_snapshot: item.nombre,
    precio_unitario: Number(item.precio),
    cantidad: Number(item.cantidad),
    adiciones: item.adiciones.map((adicion) => ({
      producto_id: adicion.id,
      nombre_producto_snapshot: adicion.nombre,
      precio_unitario: Number(adicion.precio),
      cantidad_por_unidad: Number(adicion.cantidad)
    })),
    remociones: item.remociones.map((ingrediente) => ({
      producto_id: ingrediente.id,
      nombre_producto_snapshot: ingrediente.nombre
    }))
  }))
})

const seleccion = async () => {
  
  if (pedido.value.length === 0) {
    window.alert('Debes agregar al menos un elemento al pedido')
    return
  }

  if (!nombre.value || nombre.value.trim() === "") {
    alert("El nombre es obligatorio");
    return;
  }

  if (!tipoServicio.value) {
    alert("Debes seleccionar el tipo de servicio");
    return;
  }

  guardandoPedido.value = true

  const esEdicion = !!pedidoId.value
  const url = esEdicion ? `http://localhost:3000/pedidos/${pedidoId.value}` : 'http://localhost:3000/pedidos'
  const method = esEdicion ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(construirPayloadPedido())
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'No se pudo guardar el pedido')
    }

    window.alert(esEdicion ? 'El pedido fue actualizado con exito' : 'El pedido fue realizado con exito')
    router.push('/tabs/ventas')
  } catch (error) {
    console.error('Error guardando pedido', error)
    window.alert(error.message || 'No se pudo guardar el pedido')
  } finally {
    guardandoPedido.value = false
  }
}

onMounted(async () => {
  if (!puedeGestionarPedidos.value) {
    window.alert('No tienes permisos para acceder a pedidos')
    window.location.replace('/tabs/ventas')
    return
  }

  await cargarCategorias()
  await cargarMenuCompleto()
  await cargarPedidoEdicion()
})
</script>

<style>
* { box-sizing: border-box; }
.fondo { --background: #f5f1e8; }
.contenedor-formulario { padding: 15px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: start; }
.estado-carga { padding: 20px; text-align: center; font-weight: 700; }
.layout-ventas { display: grid; grid-template-columns: 240px minmax(0, 1fr) 320px; gap: 16px; padding: 0 15px 15px; align-items: start; }
.panel { background: #fffdf7; border: 2px solid #1f1f1f; border-radius: 18px; padding: 16px; min-height: 520px; min-width: 0; overflow: hidden; color: #1f1f1f;}
.titulo-seccion { margin: 0 0 12px; font-size: 18px; font-weight: 800; }
.input { width: 100%; min-width: 0; padding: 10px; border: 1px solid black; border-radius: 10px; background: white; display: block; }
select.input { appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>"); background-repeat: no-repeat; background-position: right 10px center; background-size: 16px; }
.lista-categorias { display: grid; gap: 12px; }
.encabezado-menu { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; min-width: 0; }
.buscador-menu { max-width: 260px; width: 100%; }
.grid-productos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; min-width: 0; }
.card-categoria, .card-producto { border: 2px solid black; border-radius: 15px; padding: 12px; background: white; color: #1f1f1f; min-width: 0; }
.card-categoria { cursor: pointer; display: flex; align-items: center; gap: 12px; text-align: left; }
.card-categoria.activa { background: black; color: white; }
.card-categoria img, .card-producto img { width: 100%; height: 100px; object-fit: cover; border-radius: 10px; margin-bottom: 8px; }
.card-categoria img { width: 54px; height: 54px; margin-bottom: 0; }
.nombre-producto { font-weight: bold; }
.descripcion-producto { min-height: 36px; }
.precio-producto { font-size: 18px; font-weight: 800; margin-bottom: 12px; }
.acciones-producto, .controles-pedido { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.contador { display: flex; align-items: center; gap: 10px; }
.btn-cantidad, .btn-agregar, .btn-eliminar, .btn-secundario { border: none; border-radius: 10px; font-weight: 700; }
.btn-cantidad { width: 32px; height: 32px; background: #1f1f1f; color: white; }
.btn-cantidad-eliminar { background: #c62828; }
.btn-agregar { padding: 10px 14px; background: #d96c06; color: white; }
.btn-eliminar { padding: 8px 12px; background: #c62828; color: white; }
.btn-secundario { padding: 8px 12px; background: #f0c14b; color: #1f1f1f; }
.btn-borrar-linea { padding: 8px 12px; border: none; border-radius: 10px; font-weight: 700; background: #6b7280; color: white; }
.lista-pedido { display: grid; gap: 12px; }
.item-pedido { border: 1px solid #1f1f1f; border-radius: 14px; padding: 12px; background: white; color: #1f1f1f; min-width: 0; }
.item-pedido-personalizado { background: #dff5df; }
.info-pedido p { margin: 0 0 6px; }
.resumen-adiciones { margin: 4px 0 8px; }
.titulo-resumen-adiciones { font-weight: 800; }
.bloque-adiciones { margin-top: 14px; padding-top: 14px; border-top: 1px dashed #1f1f1f; min-width: 0; }
.subtitulo-adiciones { margin: 0 0 10px; font-weight: 700; }
.etiqueta-adiciones { margin: 0 0 8px; font-size: 14px; font-weight: 800; }
.lista-adiciones-disponibles, .lista-adiciones-seleccionadas { display: grid; gap: 10px; }
.lista-adiciones-seleccionadas { margin-top: 12px; }
.bloque-remociones { margin-top: 16px; }
.adicion-disponible, .adicion-seleccionada { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px; border: 1px solid #1f1f1f; border-radius: 12px; background: #fff7e8; min-width: 0; flex-wrap: wrap; }
.adicion-disponible > div, .adicion-seleccionada > div:first-child { flex: 1; min-width: 0; }
.btn-agregar-adicion, .btn-quitar-ingrediente { margin-left: auto; flex-shrink: 0; }
.btn-agregar-adicion { padding: 8px 12px; }
.estado-adiciones, .estado-vacio { padding: 18px 0; text-align: center; }
.resumen-total { margin-top: 16px; padding-top: 16px; border-top: 2px solid #1f1f1f; color: #1f1f1f; position: sticky; bottom: 0; background: #fffdf7; z-index: 5; }
.resumen-total p { margin: 0 0 8px; }
.total-final { font-size: 22px; font-weight: 800; }
.boton-registrar { width: 100%; padding: 14px; border-radius: 12px; border: none; background: black; color: white; font-weight: bold; margin-top: 12px; }
.boton-registrar:disabled { opacity: 0.7; }
@media (max-width: 1100px) { .layout-ventas { grid-template-columns: 1fr; } .panel { min-height: auto; } }
@media (max-width: 768px) { .contenedor-formulario { grid-template-columns: 1fr; } .encabezado-menu { flex-direction: column; align-items: stretch; } .buscador-menu, .grid-productos { max-width: none; grid-template-columns: 1fr; } }
</style>
