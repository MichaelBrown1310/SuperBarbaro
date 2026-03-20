<template>

<ion-page>

<AppHeader titulo="NUEVA CATEGORÍA" />

<ion-content class="fondo">

<div class="contenedor">

<img :src="preview || 'https://via.placeholder.com/100'" class="img" />

<input type="file" @change="cargarImagen" />

<input v-model="nombre" placeholder="Nombre de la categoría" />

<input v-model="imagenUrl" placeholder="URL imagen (opcional)" />

<button class="btn" @click="guardar">Confirmar</button>

</div>

</ion-content>

</ion-page>

</template>

<script setup>

import { IonPage, IonContent } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'

const router = useRouter()

const nombre = ref('')
const imagenUrl = ref('')
const preview = ref(null)

// IMAGEN LOCAL
const cargarImagen = (e)=>{
  const file = e.target.files[0]
  if(file){
    preview.value = URL.createObjectURL(file)
  }
}

//  GUARDAR
const guardar = async ()=>{

  const imagenFinal = imagenUrl.value || preview.value

  await fetch('http://localhost:3000/categorias',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      nombre: nombre.value,
      imagen: imagenFinal
    })
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
width:100px;
margin-bottom:10px;
}

input{
width:100%;
padding:10px;
margin-bottom:10px;
border-radius:10px;
border:1px solid black;
}

.btn{
width:100%;
padding:12px;
border-radius:10px;
background:black;
color:white;
}

</style>
