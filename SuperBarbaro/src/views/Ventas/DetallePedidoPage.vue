<template>
  <ion-page>
    <AppHeader titulo="DETALLE PEDIDO" />

    <ion-content class="fondo">
      <div class="contenedor">
        <div v-if="cargando" class="estado">Cargando pedido...</div>

        <div v-else-if="!pedido" class="estado">No se encontro el pedido</div>

        <div v-else class="detalle">
          <div class="tarjeta">
            <p class="numero">{{ pedido.numero_pedido }}</p>
            <p><strong>Cliente:</strong> {{ pedido.cliente_nombre || 'Sin nombre' }}</p>
            <p><strong>Telefono:</strong> {{ pedido.cliente_telefono || 'Sin telefono' }}</p>
            <p><strong>Servicio:</strong> {{ formatearServicio(pedido.tipo_servicio) }}</p>
            <p><strong>Estado:</strong> {{ formatearEstado(pedido.estado) }}</p>
            <p><strong>Hora:</strong> {{ formatearHora(pedido.fecha_creacion) }}</p>
          </div>

          <div class="tarjeta">
            <h2>Elementos</h2>

            <div v-for="item in pedido.items" :key="item.menu_id + '-' + item.nombre_menu_snapshot" class="item">
              <p class="nombre">{{ item.nombre_menu_snapshot }} x{{ item.cantidad }}</p>
              <p>Subtotal: ${{ formatearPrecio(item.subtotal_final) }}</p>

              <div v-if="item.adiciones?.length">
                <p class="subtitulo">Adiciones</p>
                <p v-for="adicion in item.adiciones" :key="`${item.menu_id}-${adicion.producto_id}`">
                  {{ adicion.nombre_producto_snapshot }} x{{ adicion.cantidad_total }}
                </p>
              </div>

              <div v-if="item.remociones?.length">
                <p class="subtitulo">Sin</p>
                <p v-for="remocion in item.remociones" :key="`${item.menu_id}-r-${remocion.producto_id}`">
                  {{ remocion.nombre_producto_snapshot }}
                </p>
              </div>
            </div>
          </div>

          <div class="tarjeta tarjeta-accion">
            <p class="total-linea"><strong>Total:</strong> ${{ formatearPrecio(pedido.total) }}</p>

            <button
              v-if="mostrarBotonEditar"
              class="boton-editar"
              :disabled="pedido.estado !== 'pendiente'"
              @click="editarPedido"
            >
              {{ pedido.estado === 'pendiente' ? 'Editar pedido' : 'No editable' }}
            </button>

            <button
              v-else-if="textoBotonCocina"
              class="boton-cocina"
              @click="cambiarEstadoPedido"
            >
              {{ textoBotonCocina }}
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { socket } from '@/utils/socket'

const route = useRoute()
const router = useRouter()
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
const rolUsuario = (usuario?.rol || '').toString().trim().toUpperCase()

const pedido = ref(null)
const cargando = ref(false)

const refrescarDetalleSocket = (payload) => {
  if (!payload || Number(payload.id) === Number(route.params.id)) {
    cargarPedido()
  }
}

const cargarPedido = async () => {
  cargando.value = true

  try {
    const res = await fetch(`http://localhost:3000/pedidos/${route.params.id}`)
    if (!res.ok) {
      pedido.value = null
      return
    }

    pedido.value = await res.json()
  } catch (error) {
    console.error('Error cargando detalle del pedido', error)
    pedido.value = null
  } finally {
    cargando.value = false
  }
}

const editarPedido = () => {
  if (!pedido.value || pedido.value.estado !== 'pendiente') {
    return
  }

  router.push(`/nueva-orden?pedidoId=${pedido.value.id}`)
}

const esRolGestion = computed(() => rolUsuario === 'ADMINISTRADOR' || rolUsuario === 'CAJERO')
const esRolCocina = computed(() => rolUsuario === 'COCINA' || rolUsuario === 'COCINERO')
const mostrarBotonEditar = computed(() => esRolGestion.value)

const siguienteEstadoCocina = computed(() => {
  if (!pedido.value || !esRolCocina.value) {
    return null
  }

  if (pedido.value.estado === 'pendiente') {
    return 'en_preparacion'
  }

  if (pedido.value.estado === 'en_preparacion') {
    return 'listo'
  }

  return null
})

const textoBotonCocina = computed(() => {
  if (siguienteEstadoCocina.value === 'en_preparacion') {
    return 'Pasar a preparacion'
  }

  if (siguienteEstadoCocina.value === 'listo') {
    return 'Marcar como listo'
  }

  return ''
})

const cambiarEstadoPedido = async () => {
  if (!pedido.value || !siguienteEstadoCocina.value) {
    return
  }

  const mensaje = siguienteEstadoCocina.value === 'en_preparacion'
    ? '¿Quieres cambiar el pedido a En preparacion?'
    : '¿Quieres cambiar el pedido a Listo?'

  if (!window.confirm(mensaje)) {
    return
  }

  try {
    const res = await fetch(`http://localhost:3000/pedidos/${pedido.value.id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estado: siguienteEstadoCocina.value
      })
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'No se pudo actualizar el estado')
    }

    pedido.value.estado = data.estado
    window.alert('El estado del pedido fue actualizado')
  } catch (error) {
    console.error('Error actualizando estado del pedido', error)
    window.alert('No se pudo actualizar el estado del pedido')
  }
}

const formatearServicio = (servicio) => servicio === 'comer aqui' ? 'Comer aqui' : 'Llevar'
const formatearEstado = (estado) => ({
  pendiente: 'Pendiente',
  en_preparacion: 'En preparacion',
  listo: 'Listo',
  entregado: 'Entregado'
}[estado] || estado)

const formatearHora = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearPrecio = (valor) => Number(valor || 0).toLocaleString('es-CO')

onIonViewWillEnter(cargarPedido)
onIonViewWillEnter(() => {
  socket.off('pedido:detalle-actualizado', refrescarDetalleSocket)
  socket.off('pedidos:actualizados', cargarPedido)
  socket.on('pedido:detalle-actualizado', refrescarDetalleSocket)
  socket.on('pedidos:actualizados', cargarPedido)
})

onIonViewWillLeave(() => {
  socket.off('pedidos:actualizados', cargarPedido)
  socket.off('pedido:detalle-actualizado', refrescarDetalleSocket)
})
</script>

<style>
.fondo {
  --background: #f5f1e8;
}

.contenedor {
  padding: 16px;
}

.detalle {
  display: grid;
  gap: 16px;
  color: #1f1f1f;
}

.tarjeta {
  background: white;
  border: 2px solid #1f1f1f;
  border-radius: 16px;
  padding: 16px;
  color: #1f1f1f;
}

.tarjeta p,
.tarjeta h2 {
  margin: 0 0 10px;
}

.tarjeta-accion {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.numero,
.nombre {
  font-weight: 800;
}

.item {
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
}

.item:last-child {
  border-bottom: none;
}

.subtitulo {
  margin-top: 8px;
  font-weight: 700;
}

.estado {
  padding: 40px 0;
  text-align: center;
  font-weight: 700;
}

.boton-editar {
  min-width: 220px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: black;
  color: white;
  font-weight: 700;
}

.boton-editar:disabled {
  opacity: 0.6;
}

.boton-cocina {
  min-width: 220px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #d96c06;
  color: white;
  font-weight: 700;
}

.total-linea {
  margin: 0;
  font-size: 20px;
}

@media (max-width: 768px) {
  .tarjeta-accion {
    flex-direction: column;
    align-items: stretch;
  }

  .boton-editar,
  .boton-cocina {
    width: 100%;
    min-width: 0;
  }
}
</style>
