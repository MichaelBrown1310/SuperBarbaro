<template>

<ion-page>

<AppHeader titulo="EDITAR" />

<ion-content class="fondo">

<div v-if="producto" class="contenedor">

<!-- 👀 PREVIEW -->
<img :src="preview || producto.imagen || 'https://via.placeholder.com/150'" class="img" />

<!-- 📁 SUBIR DESDE PC -->
<input type="file" @change="cargarImagen" />

<p class="separador"></p>

<!-- 🌐 IMAGEN POR URL -->
<input v-model="urlImagen" placeholder="Pegar URL de imagen" />

<button class="btn-secundario" @click="usarUrl">
  Usar imagen de internet
</button>

<p class="separador"></p>

<!-- DATOS -->
<input v-model="producto.nombre" placeholder="Nombre" />
<input v-model="producto.precio" placeholder="Precio" />
<input v-model="producto.cantidad" placeholder="Cantidad" />

<!-- BOTON GUARDAR -->
<button class="btn" @click="guardar">Confirmar</button>

<!-- ELIMINAR -->
<p class="eliminar" @click="eliminar">Eliminar producto</p>

</div>

</ion-content>

</ion-page>

</template>

<script setup>

import { IonPage, IonContent } from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const producto = ref(null)
const preview = ref(null)
const urlImagen = ref('')

// 🔥 GUARDAR CANTIDAD ORIGINAL
const cantidadOriginal = ref(0)

// CARGAR PRODUCTO
const cargar = async ()=>{
  const res = await fetch(`http://localhost:3000/producto/${route.params.id}`)
  producto.value = await res.json()

  // 🔥 guardar cantidad inicial
  cantidadOriginal.value = producto.value.cantidad
}

onMounted(cargar)

// SUBIR DESDE PC
const cargarImagen = (e)=>{
  const file = e.target.files[0]
  if(file){
    preview.value = URL.createObjectURL(file)
    producto.value.imagen = preview.value
  }
}

// USAR URL
const usarUrl = ()=>{
  if(urlImagen.value){
    producto.value.imagen = urlImagen.value
    preview.value = urlImagen.value
  }
}

// 🔥 GUARDAR CON HISTORIAL
const guardar = async ()=>{

  const nuevaCantidad = parseInt(producto.value.cantidad)
  const anterior = parseInt(cantidadOriginal.value)

  const diferencia = nuevaCantidad - anterior

  // 🔥 SOLO SI HUBO CAMBIO
  if (diferencia !== 0) {

    const tipo = diferencia > 0 ? "ENTRADA" : "SALIDA"

    await fetch('http://localhost:3000/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: producto.value.id,
        tipo: tipo,
        cantidad: Math.abs(diferencia),
        motivo: 'Edición manual'
      })
    })
  }

  // 🔥 ACTUALIZA PRODUCTO
  await fetch(`http://localhost:3000/productos/${producto.value.id}`,{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(producto.value)
  })

  router.back()
}

// ELIMINAR
const eliminar = async ()=>{
  await fetch(`http://localhost:3000/productos/${producto.value.id}`,{
    method:'DELETE'
  })

  router.push('/tabs/inventario')
}

</script>

<style>

.fondo{
--background:white;
}

.contenedor{
padding:20px;
}

.img{
width:120px;
border-radius:10px;
margin-bottom:10px;
display:block;
}

input{
width:100%;
padding:10px;
margin-bottom:10px;
border-radius:10px;
border:1px solid black;
background:white;
}

.btn{
width:100%;
padding:12px;
border-radius:10px;
background:black;
color:white;
margin-top:10px;
}

.btn-secundario{
width:100%;
padding:10px;
border-radius:10px;
background:#ddd;
margin-bottom:10px;
color:black;
}

.eliminar{
margin-top:15px;
color:red;
text-align:center;
}

.separador{
text-align:center;
margin:5px 0;
font-weight:bold;
}

</style>
