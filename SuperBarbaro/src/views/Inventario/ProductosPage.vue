<template>

<ion-page>

<AppHeader :titulo="nombreCategoria.toUpperCase()" />

<ion-content class="fondo">

<div class="contenedor">

<!-- BUSCADOR -->
<input v-model="busqueda" placeholder="Buscar producto..." class="input" />

<div v-if="filtrados.length === 0">
No hay productos
</div>

<div class="grid">

<div class="card" v-for="p in filtrados" :key="p.id" @click="verProducto(p)">

<img :src="p.imagen || 'https://via.placeholder.com/100'" />

<p>{{p.nombre}}</p>
<p>Cantidad: {{p.cantidad}}</p>

</div>
</div>
<p>

</p>
<!-- BOTON NUEVO -->
<button class="btn" @click="nuevo">+ Nuevo Producto</button>

</div>
</ion-content>

</ion-page>

</template>

<script setup>

import { IonPage, IonContent } from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import AppHeader from '../../components/AppHeader.vue'

const categorias = ref([])
const nombreCategoria = ref('')

const route = useRoute()
const router = useRouter()

const categoria = ref('')


const productos = ref([])
const busqueda = ref('')

const cargarCategorias = async () => {
  const res = await fetch('http://localhost:3000/categorias')
  categorias.value = await res.json()
}

onMounted(() => {
  categoria.value = route.params.categoria
  cargar()
})

const cargar = async () => {

  await cargarCategorias()

  const categoriaNombre = route.params.categoria

  const cat = categorias.value.find(c => c.nombre === categoriaNombre)

  if (!cat) {
    console.log("Categoría no encontrada")
    return
  }

  nombreCategoria.value = cat.nombre

  const res = await fetch(`http://localhost:3000/productos/${cat.id}`)
  productos.value = await res.json()
}

const filtrados = computed(()=>{
  return productos.value.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

const verProducto = (p)=>{
  router.push(`/tabs/producto/${p.id}`)
}

const nuevo = () => {
  router.push('/tabs/nuevo-producto/' + categoria.value)
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
background-color: rgba(255, 255, 255, 0.71);
border:2px solid black;
border-radius:15px;
padding:10px;
text-align:center;
}

.card img{
width:100%;
height:100px;
object-fit:cover;
border-radius:10px;
}

.input{
background-color: rgba(255, 252, 252, 0.548);
width:100%;
padding:10px;
margin-bottom:10px;
border-radius:10px;
border:1px solid black;
}

.btn{
width:100%;
padding:10px;
margin-bottom:15px;
border-radius:10px;
background:black;
color:white;
padding:15px;
display:grid;
text-align:center;
object-fit:cover;
}

</style>
