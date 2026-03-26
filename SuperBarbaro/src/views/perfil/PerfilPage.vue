<template>

  <ion-page>

    <AppHeader titulo="PERFIL" />

    <template #end>
      <ion-button @click="editarPerfil">
        <ion-icon :icon="createOutline"></ion-icon>
      </ion-button>
    </template>


    <ion-content class="fondo">

      <div class="contenedor">

        <div class="foto-perfil">
          <ion-icon :icon="person" class="icono"></ion-icon>
        </div>

        <p class="rol">{{ usuario.rol }}</p>

        <div class="datos">

          <p><b>Nombre:</b> {{ usuario.nombre }} {{ usuario.apellido }}</p>
          <p><b>Correo:</b> {{ usuario.correo }}</p>
          <p><b>Teléfono:</b> {{ usuario.telefono }}</p>
          <p><b>Dirección:</b> {{ usuario.direccion }}</p>

        </div>

        <div class="boton-usuarios" @click="irUsuarios">
          Usuarios
        </div>

        <p class="cerrar" @click="cerrarSesion">
          Cerrar sesión
        </p>

      </div>

    </ion-content>

  </ion-page>

</template>


<script setup>

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/vue'

import { person, createOutline } from 'ionicons/icons'
import AppHeader from '@/components/AppHeader.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const usuario = ref({})

onMounted(() => {

  const data = localStorage.getItem("usuario")

  if (data) {

    usuario.value = JSON.parse(data)

  }

})

const irUsuarios = () => {

  router.push('/usuarios')

}

const cerrarSesion = () => {

  localStorage.removeItem("usuario")

  router.push('/login')

}

const editarPerfil = () => {

  console.log("editar perfil")

}

</script>


<style>
.fondo {
  --background: white;
}

.toolbar {
  --background: white;
  border-bottom: 2px solid black;
}


.contenedor {

  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 30px;

  color: black;

}

.foto-perfil {

  width: 120px;
  height: 120px;

  border-radius: 50%;

  background: black;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 15px;

}

.icono {

  font-size: 70px;
  color: white;

}

.rol {

  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 20px;

}

.datos {

  width: 60%;

  font-size: 16px;

  margin-bottom: 25px;

}

.boton-usuarios {

  border: 2px solid black;

  border-radius: 20px;

  padding: 8px 30px;

  font-weight: bold;

  cursor: pointer;

  margin-bottom: 15px;

}

.cerrar {

  color: red;

  cursor: pointer;

}
</style>
