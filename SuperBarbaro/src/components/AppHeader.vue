<template>

  <ion-header>

    <ion-toolbar class="super-toolbar">

      <ion-title class="title-barbaro">
        {{ titulo }}
      </ion-title>

    </ion-toolbar>

  </ion-header>

</template>

<script setup>

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/vue'

import {
  useRoute
} from 'vue-router'

defineProps({
  titulo: String
})

</script>

<style>
.barra {
  --background: white;
  --color: black;
  border-bottom: 2px solid black;
}

.titulo {
  text-align: center;
  font-weight: 600;
  font-size: 20px;
  color: black;
}

ion-icon {
  --background: white;

}

/* nuevo*/

/* TOOLBAR BASE */
.super-toolbar {
  --background: linear-gradient(135deg, #0a0a0a, #1c1c1c);
  --color: white;

  position: relative;

  border-bottom: none;

  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

/* EFECTO LÍNEA DE ENERGÍA */
.super-toolbar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 3px;

  background: linear-gradient(90deg,
      transparent,
      #ff3b3b,
      #ff7a00,
      #ff3b3b,
      transparent);

  animation: energia 3s linear infinite;
}

/* ANIMACIÓN */
@keyframes energia {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* TÍTULO PRO */
.title-barbaro {
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;

  background: linear-gradient(90deg,
      #ff3b3b,
      #ff7a00,
      #ffd000);

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow:
    0 0 10px rgba(255, 60, 60, 0.4),
    0 0 20px rgba(255, 120, 0, 0.2);

  animation: glow 2s ease-in-out infinite alternate;
}

/* GLOW SUAVE */
@keyframes glow {
  from {
    text-shadow:
      0 0 5px rgba(255, 60, 60, 0.3),
      0 0 10px rgba(255, 120, 0, 0.2);
  }

  to {
    text-shadow:
      0 0 15px rgba(255, 60, 60, 0.6),
      0 0 25px rgba(255, 120, 0, 0.4);
  }
}
</style>
