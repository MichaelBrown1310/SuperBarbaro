<template>
  <ion-page>
    <AppHeader titulo="NUEVA ORDEN" />

    <ion-content class="fondo">
      <div class="contenedor-formulario">
        <input class="input" placeholder="Nombre" v-model="nombre" />

        <select class="input" v-model="tipoServicio">
          <option value="llevar">Llevar</option>
          <option value="comer aqui">Comer aqui</option>
        </select>

        <input class="input" placeholder="Telefono" v-model="telefono" />
      </div>

      <div class="layout-ventas">
        <section class="panel panel-categorias">
          <h2 class="titulo-seccion">Categorias</h2>

          <div class="lista-categorias">
            <button
              class="card-categoria"
              :class="{ activa: categoriaSeleccionada?.id === c.id }"
              v-for="c in categorias"
              :key="c.id"
              @click="seleccionarCategoria(c)"
            >
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

            <input
              class="input buscador-menu"
              placeholder="Buscar en el menu..."
              v-model="busqueda"
            />
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
            <div class="item-pedido" v-for="item in pedido" :key="item.id">
              <div class="info-pedido">
                <p class="nombre-producto">{{ item.nombre }}</p>
                <p>${{ formatearPrecio(item.precio) }} c/u</p>
                <p>Subtotal: ${{ formatearPrecio(item.precio * item.cantidad) }}</p>
              </div>

              <div class="controles-pedido">
                <div class="contador">
                  <button class="btn-cantidad" @click="disminuirPedido(item.id)">-</button>
                  <span>{{ item.cantidad }}</span>
                  <button class="btn-cantidad" @click="aumentarPedido(item.id)">+</button>
                </div>

                <button class="btn-eliminar" @click="eliminarDelPedido(item.id)">
                  Quitar
                </button>
              </div>
            </div>
          </div>

          <div class="resumen-total">
            <p>Items: {{ totalItems }}</p>
            <p class="total-final">Total: ${{ formatearPrecio(totalPedido) }}</p>
          </div>
        </section>
      </div>

      <div class="contenedor-boton">
        <button class="boton-registrar" @click="seleccion">
          CONTINUAR
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const router = useRouter()

const nombre = ref('')
const telefono = ref('')
const tipoServicio = ref('llevar')

const categorias = ref([])
const categoriaSeleccionada = ref(null)
const menu = ref([])
const busqueda = ref('')
const cantidadesTemporales = ref({})
const pedido = ref([])

const cargarCategorias = async () => {
  const res = await fetch('http://localhost:3000/categorias')
  categorias.value = await res.json()

  if (categorias.value.length > 0) {
    seleccionarCategoria(categorias.value[0])
  }
}

const seleccionarCategoria = async (categoria) => {
  categoriaSeleccionada.value = categoria
  busqueda.value = ''

  const res = await fetch(`http://localhost:3000/menu/${categoria.id}`)
  menu.value = await res.json()
  inicializarCantidades()
}

const menuFiltrado = computed(() => {
  return menu.value.filter((item) =>
    item.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

const totalItems = computed(() => {
  return pedido.value.reduce((acumulado, item) => acumulado + item.cantidad, 0)
})

const totalPedido = computed(() => {
  return pedido.value.reduce((acumulado, item) => acumulado + (Number(item.precio) * item.cantidad), 0)
})

const inicializarCantidades = () => {
  const cantidades = {}

  menu.value.forEach((item) => {
    cantidades[item.id] = 1
  })

  cantidadesTemporales.value = cantidades
}

const aumentarTemporal = (item) => {
  const actual = cantidadesTemporales.value[item.id] || 1
  cantidadesTemporales.value[item.id] = actual + 1
}

const disminuirTemporal = (item) => {
  const actual = cantidadesTemporales.value[item.id] || 1
  cantidadesTemporales.value[item.id] = actual > 1 ? actual - 1 : 1
}

const agregarAlPedido = (item) => {
  const cantidadSeleccionada = cantidadesTemporales.value[item.id] || 1
  const existente = pedido.value.find((pedidoItem) => pedidoItem.id === item.id)

  if (existente) {
    existente.cantidad += cantidadSeleccionada
  } else {
    pedido.value.push({
      ...item,
      precio: Number(item.precio),
      cantidad: cantidadSeleccionada
    })
  }

  cantidadesTemporales.value[item.id] = 1
}

const aumentarPedido = (id) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.id === id)

  if (item) {
    item.cantidad += 1
  }
}

const disminuirPedido = (id) => {
  const item = pedido.value.find((pedidoItem) => pedidoItem.id === id)

  if (!item) {
    return
  }

  if (item.cantidad > 1) {
    item.cantidad -= 1
    return
  }

  pedido.value = pedido.value.filter((pedidoItem) => pedidoItem.id !== id)
}

const eliminarDelPedido = (id) => {
  pedido.value = pedido.value.filter((pedidoItem) => pedidoItem.id !== id)
}

const formatearPrecio = (valor) => {
  return Number(valor || 0).toLocaleString('es-CO')
}

const seleccion = () => {
  router.push('')
}

onMounted(cargarCategorias)
</script>

<style>
.fondo {
  --background: #f5f1e8;
}

.contenedor-formulario,
.contenedor-boton {
  padding: 15px;
}

.contenedor-formulario {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.layout-ventas {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 320px;
  gap: 16px;
  padding: 0 15px 15px;
  align-items: start;
}

.panel {
  background: #fffdf7;
  border: 2px solid #1f1f1f;
  border-radius: 18px;
  padding: 16px;
  min-height: 520px;
}

.titulo-seccion {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 800;
}

.input {
  width: 100%;
  padding: 10px;
  margin-bottom: 0;
  border: 1px solid black;
  border-radius: 10px;
  background: white;
}

select.input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.lista-categorias {
  display: grid;
  gap: 12px;
}

.encabezado-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.buscador-menu {
  max-width: 260px;
}

.grid-productos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.card-categoria,
.card-producto {
  border: 2px solid black;
  border-radius: 15px;
  padding: 12px;
  background: white;
  color: #1f1f1f;
}

.card-categoria {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.card-categoria.activa {
  background: black;
  color: white;
}

.card-categoria img,
.card-producto img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 8px;
}

.card-categoria img {
  width: 54px;
  height: 54px;
  margin-bottom: 0;
}

.nombre-producto {
  font-weight: bold;
}

.descripcion-producto {
  min-height: 36px;
}

.precio-producto {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 12px;
}

.acciones-producto,
.controles-pedido {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.contador {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-cantidad,
.btn-agregar,
.btn-eliminar {
  border: none;
  border-radius: 10px;
  font-weight: 700;
}

.btn-cantidad {
  width: 32px;
  height: 32px;
  background: #1f1f1f;
  color: white;
}

.btn-agregar {
  padding: 10px 14px;
  background: #d96c06;
  color: white;
}

.btn-eliminar {
  padding: 8px 12px;
  background: #c62828;
  color: white;
}

.lista-pedido {
  display: grid;
  gap: 12px;
}

.item-pedido {
  border: 1px solid #1f1f1f;
  border-radius: 14px;
  padding: 12px;
  background: white;
  color: #1f1f1f;
}

.info-pedido p {
  margin: 0 0 6px;
}

.resumen-total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #1f1f1f;
  color: #1f1f1f;
}

.resumen-total p {
  margin: 0 0 8px;
}

.total-final {
  font-size: 22px;
  font-weight: 800;
}

.estado-vacio {
  padding: 18px 0;
  text-align: center;
}

.boton-registrar {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: black;
  color: white;
  font-weight: bold;
}

@media (max-width: 1100px) {
  .layout-ventas {
    grid-template-columns: 1fr;
  }

  .panel {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .contenedor-formulario {
    grid-template-columns: 1fr;
  }

  .encabezado-menu {
    flex-direction: column;
    align-items: stretch;
  }

  .buscador-menu,
  .grid-productos {
    max-width: none;
    grid-template-columns: 1fr;
  }
}
</style>
