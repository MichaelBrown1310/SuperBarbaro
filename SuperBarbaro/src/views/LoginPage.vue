<template>

  <ion-page>

    <ion-content class="fondoo">
      <br><br>
      <div class="contenedorr">

        <img src="/logoSuperBarbaro3.png" class="logo" />

        <input type="text" placeholder="Código" class="input-linea" v-model="codigo" />

        <input type="password" placeholder="Contraseña" class="input-linea" v-model="password"
          @keyup.enter="iniciarSesion($event)" />

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

  const response = await fetch('http://localhost:3000/login', {

    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({

      codigo: codigo.value,
      password: password.value

    })

  })

  const data = await response.json()

  if (data.success) {

    localStorage.setItem("usuario", JSON.stringify(data.user))

    router.push('/tabs')

  } else {

    alert("Usuario o contraseña incorrectos")

  }

}

</script>


<style>
/* FONDO CON IMAGEN */
ion-content.fondo {
  --background: white;
}

/* Fondo real con imagen */
ion-content.fondo::part(background) {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

ion-content.fondoo {
  --background: none;
}

/* Fondo real con imagen */
ion-content.fondoo::part(background) {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)),
    url('/fondo-fuego-superbarbaro.jpg');

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* CONTENEDOR PRINCIPAL (tipo panel oscuro) */
.contenedor {

  width: 100%;
  max-width: 350px;
  margin: auto;
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* 🔥 estilo pro */
  background: rgb(255, 255, 255);
  /* 0.6 = nivel de opacidad (entre 0 y 1) */

  padding: 5px;
  border-radius: 10px;

}

.contenedorr {

  width: 100%;
  max-width: 350px;
  margin: auto;
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* 🔥 estilo pro */
  background: rgba(190, 171, 171, 0.463);
  /* 0.6 = nivel de opacidad (entre 0 y 1) */

  padding: 25px;
  border-radius: 20px;

  /* sombra tipo glow */
  box-shadow: 0 0 25px rgb(0, 0, 0);

  /* efecto vidrio */
  backdrop-filter: blur(6px);
}

/* LOGO */
.logo {
  width: 250px;
  margin-bottom: 30px;
}


/* INPUTS */
.input-linea {

  width: 100%;
  padding: 12px;
  margin-bottom: 20px;

  border-radius: 10px;

  border: 1px solid rgba(63, 63, 63, 0.2);

  background: rgba(255, 255, 255, 0.664);
  color: #000000;

  font-size: 14px;
}


/* BOTÓN */
.boton {

  width: 100%;
  padding: 12px;

  border: none;
  border-radius: 25px;

  font-size: 16px;
  font-weight: bold;

  color: #000;

  background: linear-gradient(45deg, #ffe6e6, #ff0000);

  box-shadow: 0 0 15px rgba(0, 0, 0, 0.8);

  cursor: pointer;
}
</style>
