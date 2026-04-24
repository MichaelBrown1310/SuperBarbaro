<template>
  <ion-page>
    <AppHeader titulo="LISTA DE PEDIDOS" />

    <ion-content class="fondo">
      <div class="contenedor">
        <div v-if="cargando" class="estado">Cargando pedidos...</div>

        <div v-else-if="pedidos.length === 0" class="estado">
          No hay pedidos registrados
        </div>

        <div v-else class="grid-pedidos">
          <div class="card-pedido" v-for="pedido in pedidos" :key="pedido.id" @click="verDetalle(pedido.id)">
            <p class="numero-pedido">{{ pedido.numero_pedido }}</p>
            <p><strong>Cliente:</strong> {{ pedido.cliente_nombre || 'Sin nombre' }}</p>
            <p><strong>Telefono:</strong> {{ pedido.cliente_telefono || 'Sin telefono' }}</p>
            <p><strong>Servicio:</strong> {{ formatearServicio(pedido.tipo_servicio) }}</p>
            <p><strong>Estado:</strong> <PedidoEstadoChip class="estado-inline" :estado="pedido.estado" /></p>
            <p><strong>Hora:</strong> {{ formatearHora(pedido.fecha_creacion) }}</p>

            <div class="acciones" @click.stop>
              <button
                v-if="(esCocinero || esAdmin) && pedido.estado === 'pendiente'"
                @click="cambiarEstado(pedido.id, 'en_preparacion')"
              >
                Iniciar
              </button>

              <button
                v-if="(esCocinero || esAdmin) && pedido.estado === 'en_preparacion'"
                @click="cambiarEstado(pedido.id, 'completado')"
              >
                Completado
              </button>

              <button
                v-if="(esCajero || esAdmin) && pedido.estado === 'pendiente'"
                @click="cambiarEstado(pedido.id, 'cancelado')"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, onIonViewWillEnter, onIonViewWillLeave, toastController } from '@ionic/vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import PedidoEstadoChip from '@/components/PedidoEstadoChip.vue'
import { socket } from '@/utils/socket'

const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

const esAdmin = computed(() => usuario?.rol === 'ADMINISTRADOR')
const esCajero = computed(() => usuario?.rol === 'CAJERO')
const esCocinero = computed(() => usuario?.rol === 'COCINERO')

const router = useRouter()
const pedidos = ref([])
const cargando = ref(false)

const cargarPedidos = async () => {
  cargando.value = true

  try {
    const res = await fetch('https://superbarbaro.onrender.com/pedidos')
    const data = await res.json()

    pedidos.value = data.filter(p => p.estado !== 'completado' && p.estado !== 'cancelado')
  } catch (error) {
    console.error('Error cargando pedidos', error)
    pedidos.value = []
  } finally {
    cargando.value = false
  }
}

const cambiarEstado = async (id, nuevoEstado) => {
  try {
    const res = await fetch(`https://superbarbaro.onrender.com/pedidos/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    })

    const data = await res.json()

    if (!res.ok) {
      mostrarToast(data.error || 'Error', 'danger')
      return
    }

    if (nuevoEstado === 'en_preparacion') {
      mostrarToast('Pedido en preparación', 'warning')
    }

    if (nuevoEstado === 'completado') {
      mostrarToast('Pedido completado', 'success')
    }

    if (nuevoEstado === 'cancelado') {
      mostrarToast('Pedido cancelado', 'danger')
    }

    cargarPedidos()
  } catch (error) {
    console.log(error)
    mostrarToast('Error al actualizar pedido', 'danger')
  }
}

const formatearServicio = (servicio) => {
  if (servicio === 'comer aqui') {
    return 'Comer aqui'
  }

  return 'Llevar'
}

const mostrarToast = async (mensaje, color = 'success') => {
  const toast = await toastController.create({
    message: mensaje,
    duration: 2000,
    position: 'top',
    color
  })

  await toast.present()
}

const formatearHora = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const verDetalle = (id) => {
  router.push(`/detalle-pedido/${id}`)
}

onIonViewWillEnter(cargarPedidos)
onIonViewWillEnter(() => {
  socket.off('pedidos:actualizados', cargarPedidos)
  socket.on('pedidos:actualizados', cargarPedidos)
})

onIonViewWillLeave(() => {
  socket.off('pedidos:actualizados', cargarPedidos)
})
</script>

<style>
.fondo {
  --background: #f5f1e8;
}

.contenedor {
  padding: 16px;
}

.grid-pedidos {
  display: grid;
  grid-template-columns: repeat(2, minmax(250px, 1fr));
  gap: 16px;
}

.card-pedido {
  background: white;
  border: 2px solid #1f1f1f;
  border-radius: 16px;
  padding: 18px 22px;
  color: #1f1f1f;
  cursor: pointer;
}

.card-pedido p {
  margin: 0 0 10px;
}

.numero-pedido {
  font-size: 18px;
  font-weight: 800;
}

.estado {
  text-align: center;
  padding: 40px 0;
  font-weight: 700;
}

.estado-inline {
  margin-left: 8px;
}

.acciones {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.acciones button {
  border: none;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
  font-weight: bold;
}

.acciones button:nth-child(1) {
  background: #fde68a;
}

.acciones button:nth-child(2) {
  background: #bbf7d0;
}

.acciones button:nth-child(3) {
  background: #fecaca;
}

@media (max-width: 768px) {
  .grid-pedidos {
    grid-template-columns: 1fr;
  }
}
</style>
