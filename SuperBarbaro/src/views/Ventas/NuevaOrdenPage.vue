<template>

  <ion-page>

    <AppHeader titulo="NUEVA ORDEN" />

    <ion-content class="fondo">


      <div class="contenedor1">
        <div>
          <input class="input" placeholder="Nombre" v-model="nombre" />
          <select name="Domicilio" class="input">
            <option value="">Llevar</option>
            <option value="">Comer aqui</option>
          </select>
          <input class="input" placeholder="Teléfono" v-model="telefono" />

        </div>
      </div>

      <div class="contenedor-boton">

        <button class="boton-registrar" @click="Seleccion">
          CONTINUAR
        </button>

      </div>

    </ion-content>

  </ion-page>

</template>

<script setup>


import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '../../components/AppHeader.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const usuarios = ref([])



const seleccion = () => {

  router.push('')

}

</script>

<style>
.fondo {
  background: rgb(92, 37, 37);
}

.boton-general {
  width: 200px;
  height: 200px;
  border: 2px solid black;
  border-radius: 25px;


  background: transparent;
  color: black;

  font-weight: bold;
}

/* Contenedor general del select */
select {
  width: 100%;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid #000;
  padding: 8px 5px;
  font-size: 14px;
  color: #000;
  outline: none;
  appearance: none;
  /* Quita estilo por defecto */
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

/* Flechita personalizada */
select {
  background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 5px center;
  background-size: 16px;
}

/* Hover y focus */
select:hover {
  border-bottom: 2px solid #555;
}

select:focus {
  border-bottom: 2px solid #000;
}

/* Opciones */
option {
  background-color: #fff;
  color: #000;
  font-size: 14px;
}

/* Opción seleccionada */
option:checked {
  background-color: #000;
  color: #fff;
}

.contenedor1 {
  display: flex;
  justify-content: center;
  /* horizontal */
  align-items: center;
  /* vertical */
  height: 50vh;
  /* importante si quieres centrar en toda la pantalla */
}
</style>
