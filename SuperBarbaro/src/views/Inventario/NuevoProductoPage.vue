<template>

<ion-page>

<AppHeader titulo="NUEVO PRODUCTO" />

<ion-content class="fondo">

<div class="contenedor">

<!-- IMAGEN -->
<div class="foto" @click="abrirArchivos">
<img v-if="imagenPreview" :src="imagenPreview" />
<span v-else>Seleccionar</span>
</div>

<input type="file" ref="inputFile" @change="cargarArchivo" hidden />

<!-- URL OPCIONAL -->
<input class="input" placeholder="URL de imagen (opcional)" v-model="imagenUrl" />

<input class="input" placeholder="Nombre" v-model="nombre" />
<input class="input" placeholder="Precio" v-model="precio" type="number" />
<input class="input" placeholder="Cantidad" v-model="cantidad" type="number" />

<button class="boton" @click="guardar">Guardar</button>

</div>

</ion-content>

</ion-page>

</template>

<script setup>

import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '../../components/AppHeader.vue'

import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const nombre = ref('')
const precio = ref('')
const cantidad = ref('')
const imagenUrl = ref('')
const imagenPreview = ref(null)

const inputFile = ref(null)

// abrir selector
const abrirArchivos = () => {
  inputFile.value.click()
}

// convertir imagen a base64
const cargarArchivo = (event) => {
  const file = event.target.files[0]

  if (file) {
    const reader = new FileReader()

    reader.onload = (e) => {
      imagenPreview.value = e.target.result
    }

    reader.readAsDataURL(file)
  }
}

// guardar
const guardar = async () => {

  const categoria = route.params.categoria

  const imagenFinal = imagenUrl.value || imagenPreview.value

  console.log("Categoria:", categoria)

  try {

    const res = await fetch('http://localhost:3000/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.value,
        precio: precio.value,
        cantidad: cantidad.value,
        imagen: imagenFinal,
        categoria: categoria
      })
    })

    const data = await res.json()

    console.log(data)

    router.push('/tabs/productos/' + categoria)

  } catch (error) {
    console.log("Error:", error)
  }

}

</script>

<style>

.fondo{
--background:white;
}

.contenedor{
display:flex;
flex-direction:column;
align-items:center;
margin-top:20px;
}

.foto{
width:120px;
height:120px;
background:#ddd;
display:flex;
align-items:center;
justify-content:center;
border-radius:10px;
margin-bottom:20px;
overflow:hidden;
}

.foto img{
width:100%;
height:100%;
object-fit:cover;
}

.input{
width:85%;
padding:10px;
border:none;
border-bottom:2px solid black;
margin-bottom:15px;
background:white;
color:black;
}

.boton{
width:85%;
padding:12px;
border:2px solid black;
border-radius:20px;
background:white;
}

</style>
