<template>

  <ion-page>

    <AppHeader titulo="PERFIL" />

    <ion-content class="fondo">

      <div class="contenedor">

        <!-- BOTON EDITAR -->
        <div class="btn-editar" @click="editarPerfil">
          <img src="https://cdn-icons-png.flaticon.com/128/1827/1827933.png" />
        </div>

        <!-- FOTO -->
        <div class="foto-perfil">
          <img v-if="usuario.foto" :src="'http://localhost:3000/' + usuario.foto" />
          <ion-icon v-else :icon="person" class="icono" />
        </div>

        <p class="rol">{{ usuario.rol }}</p>

        <!-- DATOS -->
        <div class="datos">
          <p><b>Nombre:</b> {{ usuario.nombre }} {{ usuario.apellido }}</p>
          <p><b>Correo:</b> {{ usuario.correo }}</p>
          <p><b>Teléfono:</b> {{ usuario.telefono }}</p>
          <p><b>Dirección:</b> {{ usuario.direccion }}</p>
        </div>

        <div v-if="esAdministrador" class="boton-usuarios" @click="irUsuarios">
          usuarios
        </div>

        <p class="cerrar" @click="cerrarSesion"> cerrar sesión </p>

      </div>

    </ion-content>

  </ion-page>

</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonIcon
} from '@ionic/vue'

import { person } from 'ionicons/icons'
import AppHeader from '@/components/AppHeader.vue'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const usuario = ref({})

const esAdministrador = computed(() => {
  const rol = (usuario.value?.rol || '').toUpperCase()
  return rol === 'ADMINISTRADOR'
})

onMounted(() => {
  const data = localStorage.getItem("usuario")
  if (data) usuario.value = JSON.parse(data)
})

const irUsuarios = () => {
  router.push('/usuarios')
}

const cerrarSesion = () => {
  localStorage.removeItem("usuario")
  router.push('/login')
}

const editarPerfil = () => {
  router.push('/editar-perfil')
}
</script>

<style scoped>

.fondo {
  --background: white;
}


.contenedor {
  width: 100%;
  max-width: 400px; 
  margin: 0 auto;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black;
  position: relative;
}

/* FOTO */
.foto-perfil {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  overflow: hidden;
}

.foto-perfil img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icono {
  font-size: 70px;
  color: white;
}

/* TEXTO */
.rol {
  font-weight: bold;
  margin-bottom: 20px;
}

/* DATOS */
.datos {
  width: 100%;
  max-width: 450px;
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 25px;
}

/* BOTONES */
.boton-usuarios {
  border: 2px solid black;
  border-radius: 20px;
  padding: 10px 40px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 15px;
}

.cerrar {
  color: #cc0000;
  cursor: pointer;
}

/* EDITAR */
.btn-editar {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 38px;
  height: 38px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-editar img {
  width: 18px;
}

</style>
