<template>
  <ion-header>
    <ion-toolbar class="super-toolbar">
      <ion-buttons slot="start" v-if="showBackButton">
        <ion-button @click="handleBack" class="btn-volver">
          <ion-icon :icon="chevronBackOutline"></ion-icon>
        </ion-button>
      </ion-buttons>

      <ion-title class="title-barbaro">
        {{ titulo }}
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { computed, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chevronBackOutline } from 'ionicons/icons'

const props = withDefaults(defineProps<{
  titulo?: string
  mostrarVolver?: boolean
}>(), {
  titulo: '',
  mostrarVolver: undefined
})

const emit = defineEmits<{
  (e: 'volver'): void
}>()

const route = useRoute()
const router = useRouter()
const instance = getCurrentInstance()

const showBackButton = computed(() => {
  if (typeof props.mostrarVolver === 'boolean') {
    return props.mostrarVolver
  }

  return !route.path.startsWith('/tabs')
})

const handleBack = () => {
  const hasCustomHandler = Boolean(instance?.vnode.props?.onVolver)

  if (hasCustomHandler) {
    emit('volver')
    return
  }

  router.back()
}
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

.btn-volver ion-icon {
  color: white !important;
  font-size: 25px;
}

.super-toolbar {
  --background: linear-gradient(135deg, #0a0a0a, #1c1c1c);
  --color: white;
  position: relative;
  border-bottom: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

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

@keyframes energia {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

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
