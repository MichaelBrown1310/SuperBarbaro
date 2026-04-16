<template>
  <ion-page>
    <AppHeader titulo="VENTAS" />

    <ion-content class="fondo">
      <div class="contenedor-boton">
        <button v-if="puedeGestionarPedidos" class="boton-general" @click="nuevaOrden">
          +
          <p>Nueva orden</p>
        </button>

        <button class="boton-general" @click="listaPedidos">
          =
          <p>Lista de pedidos</p>
        </button>

        <button class="boton-general" @click="pedidosHoy">
          📅
          <p>Pedidos de hoy</p>
        </button>

        <button v-if="esAdmin" class="boton-general" @click="historialVentas">
          📄
          <p>Historial</p>
        </button>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { esAdmin } from '@/utils/auth'

const router = useRouter()
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

const puedeGestionarPedidos = computed(() => {
  const rol = (usuario?.rol || '').toString().trim().toUpperCase()
  return rol === 'ADMINISTRADOR' || rol === 'CAJERO'
})

const nuevaOrden = () => {
  if (!puedeGestionarPedidos.value) {
    window.alert('No tienes permisos para generar pedidos')
    return
  }

  router.push('/nueva-orden')
}

const listaPedidos = () => {
  router.push('/lista-pedidos')
}

const pedidosHoy = () => {
  router.push('/pedidos-hoy')
}

const historialVentas = () => {
  router.push('/historial-ventas')
}

</script>

<style>
.fondo {
  --background: white;
}

.contenedor-boton {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 24px;
  flex-wrap: wrap;
}

.boton-general {
  width: 170px;
  height: 200px;
  border: 2px solid black;
  border-radius: 25px;
  background: transparent;
  color: black;
  font-weight: bold;
  font-size: 90px;
}

.boton-general p {
  margin: 0;
  font-size: 20px;
}
</style>
