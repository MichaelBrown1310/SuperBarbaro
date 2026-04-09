<template>

  <ion-page>

    <AppHeader titulo="DETALLE" />

    <ion-content class="fondo">

      <div v-if="producto" class="contenedor">

        <ion-buttons slot="end" class="editar">
          <ion-button @click="editar">
            <ion-icon :icon="createOutline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <img :src="producto.imagen || 'https://via.placeholder.com/150'" />

        <h2>{{ producto.nombre }}</h2>
        <p>Precio: {{ producto.precio }}</p>
        <p>Cantidad: {{ producto.cantidad }}</p>

        <!-- HISTORIAL -->
        <h3>Historial de movimientos</h3>

        <div v-if="movimientos.length === 0">
          <p>No hay movimientos</p>
        </div>

        <div v-for="m in movimientos" :key="m.id" class="historial">

          <p>
            {{ formatearFecha(m.fecha) }}
            -
            <strong :class="m.tipo === 'ENTRADA' ? 'entrada' : 'salida'">
              {{ m.tipo === 'ENTRADA' ? '+' : '-' }}{{ m.cantidad }}
            </strong>
          </p>

        </div>

      </div>

    </ion-content>

  </ion-page>

</template>

<script setup>

import { IonPage, IonContent, IonButtons, IonButton, IonIcon, onIonViewDidEnter } from '@ionic/vue'
import { createOutline } from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import { onIonViewWillEnter } from '@ionic/vue'

const route = useRoute()
const router = useRouter()

const producto = ref(null)
const movimientos = ref([])

// CARGAR TODO
const cargar = async () => {

  // PRODUCTO
  const res = await fetch(`http://localhost:3000/producto/${route.params.id}`)
  producto.value = await res.json()

  // HISTORIAL
  const mov = await fetch(`http://localhost:3000/movimientos/${route.params.id}`)
  movimientos.value = await mov.json()
}

onIonViewWillEnter(cargar)

// FORMATEAR FECHA BONITA
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString()
}

const editar = () => {
  router.push(`/editar-producto/${producto.value.id}`)
}

</script>

<style>
.fondo {
  --background: white;
}

.contenedor {
  padding: 20px;
  text-align: center;
  color: black;
}

img {
  width: 150px;
  border-radius: 15px;
  margin-bottom: 10px;
}

.editar {
  position: relative;
  left: 100px;
}

/* 🔥 HISTORIAL */
.historial {
  background: #f5f5f5;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  color: black;
}

/* COLORES */
.entrada {
  color: green;
  font-weight: bold;
}

.salida {
  color: red;
  font-weight: bold;
}
</style>
