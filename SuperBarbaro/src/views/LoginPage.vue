<template>

<ion-page>

<ion-content class="fondo">

<div class="contenedor">

<img src="/logoSuperBarbaro.jpg" class="logo"/>

<input 
type="text" 
placeholder="Código"
class="input-linea"
v-model="codigo"
/>

<input 
type="password" 
placeholder="Contraseña"
class="input-linea"
v-model="password"
@keyup.enter="iniciarSesion($event)"
/>

<button class="boton" @click="iniciarSesion($event)">
Iniciar Sesión
</button>

</div>

</ion-content>

</ion-page>

</template>


<script setup>

import { IonPage, IonContent } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const codigo = ref('')
const password = ref('')

const iniciarSesion = async (event) => {

event.target.blur()

const response = await fetch('http://localhost:3000/login',{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({

codigo:codigo.value,
password:password.value

})

})

const data = await response.json()

if(data.success){

localStorage.setItem("usuario",JSON.stringify(data.user))

router.push('/tabs')

}else{

alert("Usuario o contraseña incorrectos")

}

}

</script>


<style>
.fondo{
--background:#ffffff;
}

.contenedor{

width:100%;
max-width:320px;

margin:auto;

display:flex;
flex-direction:column;
align-items:center;
justify-content:center;

margin-top:80px;

}

.logo{

width:220px;

margin-bottom:60px;

}

.input-linea{

width:100%;

border:none;

border-bottom:2px solid black;

margin-bottom:35px;

padding:10px;

font-size:16px;

outline:none;

background:white;

color:black;

}

.boton{

width:100%;

padding:12px;

background:white;

border:2px solid black;

border-radius:25px;

font-size:16px;

color:black;

cursor:pointer;

}

</style>
