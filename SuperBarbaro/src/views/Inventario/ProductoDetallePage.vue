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

<h2>{{producto.nombre}}</h2>
<p>Precio: {{producto.precio}}</p>
<p>Cantidad: {{producto.cantidad}}</p>

<div class="botones">

</div>

</div>

</ion-content>

</ion-page>

</template>

<script setup>

import { IonPage, IonContent, IonButtons, IonButton, IonIcon } from '@ionic/vue'
import { createOutline } from 'ionicons/icons'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const producto = ref(null)

const cargar = async ()=>{
  const res = await fetch(`http://localhost:3000/producto/${route.params.id}`)
  producto.value = await res.json()
}

onMounted(cargar)

const editar = ()=>{
  router.push(`/tabs/editar-producto/${producto.value.id}`)
}

const actualizar = async () => {
  await fetch(`http://localhost:3000/productos/${producto.value.id}`,{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(producto.value)
  })
}

const sumar = () => {
  producto.value.cantidad++
}

const restar = () => {
  if (producto.value.cantidad > 0) {
    producto.value.cantidad--
  }
}

const confirmar = async () => {
  await actualizar()
}

</script>

<style>

.fondo{
--background:white;
}

.contenedor{
padding:20px;
text-align:center;
}

img{
width:150px;
border-radius:15px;
margin-bottom:10px;
}

.botones button{
margin:5px;
padding:10px;
font-size:18px;
}

.btn{
margin-top:15px;
padding:10px;
border-radius:10px;
background:black;
color:white;
width:100%;
}

.editar{
position: relative;
left: 100px;
}

.sumayresta{

border:2px solid black;
border-radius:20px;
padding:30px;
background-color:white;
color:black;
text-align:center;
}
</style>
