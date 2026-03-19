<template>

<ion-page>

<AppHeader titulo="INVENTARIO" :mostrarVolver="false" />

<ion-content class="fondo">

<div class="contenedor">

<button class="btn" @click="nuevaCategoria">+ Nueva Categoría</button>

<div class="grid">

<div class="card" v-for="c in categorias" :key="c.id" @click="ir(c.nombre)">

<img :src="c.imagen || 'https://via.placeholder.com/80'" />
<p>{{c.nombre}}</p>

</div>

</div>

</div>

</ion-content>

</ion-page>

</template>

<script setup>

import { IonPage, IonContent } from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const router = useRouter()

const categorias = ref([])

// CARGAR CATEGORIAS
const cargar = async ()=>{
  const res = await fetch('http://localhost:3000/categorias')
  categorias.value = await res.json()
}

onMounted(cargar)

// IR A PRODUCTOS
const ir = (cat)=>{
  router.push(`/tabs/productos/${cat}`)
}

// NUEVA CATEGORIA
const nuevaCategoria = ()=>{
  router.push('/tabs/nueva-categoria')
}

</script>

<style>

.fondo{
--background:white;
}

.contenedor{
padding:15px;
}

.grid{
display:grid;
grid-template-columns: repeat(2,1fr);
gap:15px;
}

.card{
border:2px solid black;
border-radius:15px;
padding:10px;
text-align:center;
}

.card img{
width:80px;
height:80px;
object-fit:contain;
}

.btn{
width:100%;
padding:10px;
margin-bottom:15px;
border-radius:10px;
background:black;
color:white;
}

</style>
