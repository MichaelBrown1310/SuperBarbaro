<template>
  <ion-page>

    <AppHeader titulo="PEDIDOS DE HOY" :mostrarVolver="true" @volver="volver" />

    <ion-content class="fondo">

      <div class="contenedor">

        <!-- ENCABEZADO -->
        <div class="titulo-dia">
           {{ fechaHoy }}
        </div>

        <!-- LISTA -->
        <div v-for="p in pedidos" :key="p.id" class="pedido">

          <div class="fila-top">
            <span class="numero">#{{ p.numero_pedido }}</span>
            <span class="hora">{{ formatearHora(p.fecha_creacion) }}</span>
          </div>

          <div class="fila">
            <span>nombre: {{ p.cliente_nombre || 'Sin nombre' }}</span>
            <span>para: {{ p.tipo_servicio }}</span>
          </div>

          <div class="fila-bottom">
            <span class="estado">{{ p.estado }}</span>
            <span class="total">Total: ${{ p.total }}</span>
          </div>

        </div>

      </div>

    </ion-content>

  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pedidos = ref([])

onMounted(() => {
  cargarPedidosHoy()
})

const cargarPedidosHoy = async () => {
  const res = await fetch('http://localhost:3000/pedidos?hoy=true')
  const data = await res.json()
  pedidos.value = data
}

const volver = () => {
  router.push('/tabs/ventas')
}

const fechaHoy = new Date().toLocaleDateString('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const formatearHora = (f) => {
  const fecha = new Date(f)

  return fecha.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.fondo {
  --background: white;
}

.contenedor {
  width: 95%;
  max-width: 1400px;
  margin: 25px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  color: black;
}

.titulo-dia {
  grid-column: 1 / -1;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  padding: 12px;
  border-bottom: 2px solid black;
  text-transform: capitalize;
}

/* CARDS */
.pedido {
  border: 2px solid black;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
}

.fila-top {
  display: flex;
  justify-content: space-between;
}

.numero {
  font-weight: bold;
}

.hora {
  font-size: 13px;
}

.fila {
  display: flex;
  justify-content: space-between;
}

.fila-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.estado {
  font-size: 12px;
  font-weight: bold;
  border: 1px solid black;
  padding: 4px 10px;
  border-radius: 10px;
}

.total {
  font-weight: bold;
}
</style>
