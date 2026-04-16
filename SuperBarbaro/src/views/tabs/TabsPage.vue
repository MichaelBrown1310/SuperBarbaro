<template>

  <ion-page>

    <ion-tabs>

      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar v-if="mostrarTabBar" slot="bottom" class="ultra-tab-bar">

        <ion-tab-button tab="ventas" href="/tabs/ventas">
          <ion-icon :icon="restaurantOutline"></ion-icon>
        </ion-tab-button>

        <ion-tab-button tab="inventario" href="/tabs/inventario">
          <ion-icon :icon="cubeOutline"></ion-icon>
        </ion-tab-button>

        <ion-tab-button tab="reportes" href="/tabs/reportes">
          <ion-icon :icon="documentTextOutline"></ion-icon>
        </ion-tab-button>

        <ion-tab-button tab="perfil" href="/tabs/perfil">
          <ion-icon :icon="personOutline"></ion-icon>
        </ion-tab-button>

      </ion-tab-bar>

    </ion-tabs>

  </ion-page>

</template>


<script setup>

import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon
} from '@ionic/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import {
  restaurantOutline,
  cubeOutline,
  documentTextOutline,
  personOutline
} from 'ionicons/icons'

const route = useRoute()

const mostrarTabBar = computed(() => {
  const rutasOcultas = [
    '/tabs/lista-pedidos',
    '/tabs/detalle-pedido'
  ]

  return !rutasOcultas.some((ruta) => route.path.startsWith(ruta))
})

</script>
<style>
/* CONTENEDOR */
.ultra-tab-bar {
  --background: rgba(0, 0, 0, 0.9);
  --border: none;


  position: fixed;
  bottom: 15px;
  left: 12px;
  right: 12px;

  height: 65px;
  border-radius: 22px;

  backdrop-filter: blur(10px);

  display: flex;
  justify-content: space-around;
  align-items: center;

  box-shadow: 0 10px 30px rgb(0, 0, 0);


  --background: transparent !important;
  background: transparent !important;
  --border: none;
}

/* BOTONES */
.ultra-tab-bar ion-tab-button {
  position: relative;
  flex: 1;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  color: #777;
  transition: all 0.3s ease;
}

/* ICONOS */
.ultra-tab-bar ion-icon {
  font-size: 22px;
  z-index: 2;
  transition: all 0.3s ease;
}

/* ACTIVO (CÁPSULA) */
.ultra-tab-bar ion-tab-button.tab-selected {
  color: rgb(0, 0, 0);
}

/* FONDO SUAVE DEL ACTIVO */
.ultra-tab-bar ion-tab-button.tab-selected::before {
  content: "";
  position: absolute;

  width: 70%;
  height: 45px;

  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0));

  border-radius: 16px;

  transition: all 0.3s ease;
}

/* ICONO ACTIVO */
.ultra-tab-bar ion-tab-button.tab-selected ion-icon {
  transform: scale(1.15);
  color: rgb(155, 0, 0);
}

/* HOVER (opcional web) */
.ultra-tab-bar ion-tab-button:hover {
  color: #2c2c2c;
}
</style>
