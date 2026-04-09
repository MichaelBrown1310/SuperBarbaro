<template>
  <ion-page>
    <AppHeader titulo="VENTAS" />

    <ion-content class="fondo">
      <div class="contenedor-boton">
        <button class="boton-general" @click="nuevaOrden">
          +
          <p>Nueva orden</p>
        </button>

        <button class="boton-general" @click="listaPedidos">
          =
          <p>Lista de pedidos</p>
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const router = useRouter()

const nuevaOrden = () => {
  router.push('/nueva-orden')
}

const listaPedidos = () => {
  router.push('/tabs/lista-pedidos')
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
