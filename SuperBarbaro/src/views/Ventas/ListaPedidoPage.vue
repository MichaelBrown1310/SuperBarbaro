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
            <p>
              <strong>Estado:</strong>
              <span class="estado-chip" :class="estadoClase(pedido.estado)">
                {{ formatearEstado(pedido.estado) }}
              </span>
            </p>
            <p><strong>Hora:</strong> {{ formatearHora(pedido.fecha_creacion) }}</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, onIonViewWillEnter } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const router = useRouter()
const pedidos = ref([])
const cargando = ref(false)

const cargarPedidos = async () => {
  cargando.value = true

  try {
    const res = await fetch('http://localhost:3000/pedidos')
    pedidos.value = await res.json()
  } catch (error) {
    console.error('Error cargando pedidos', error)
    pedidos.value = []
  } finally {
    cargando.value = false
  }
}

const formatearServicio = (servicio) => {
  if (servicio === 'comer aqui') {
    return 'Comer aqui'
  }

  return 'Llevar'
}

const formatearEstado = (estado) => {
  const estados = {
    pendiente: 'Pendiente',
    en_preparacion: 'En preparacion',
    entregado: 'Entregado'
  }

  return estados[estado] || estado
}

const estadoClase = (estado) => {
  return {
    pendiente: estado === 'pendiente',
    preparacion: estado === 'en_preparacion',
    entregado: estado === 'entregado'
  }
}

const formatearHora = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const verDetalle = (id) => {
  router.push(`/tabs/detalle-pedido/${id}`)
}

onIonViewWillEnter(cargarPedidos)
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

.estado-chip {
  display: inline-block;
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.estado-chip.pendiente {
  background: #fff1b8;
}

.estado-chip.preparacion {
  background: #dbeafe;
}

.estado-chip.entregado {
  background: #dcfce7;
}

@media (max-width: 768px) {
  .grid-pedidos {
    grid-template-columns: 1fr;
  }
}
</style>
