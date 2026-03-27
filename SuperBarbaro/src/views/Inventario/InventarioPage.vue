<template>

  <ion-page>

    <AppHeader titulo="INVENTARIO" :mostrarVolver="false" />

    <ion-content class="fondo">

      <div class="contenedor">

        <button class="btn" @click="nuevaCategoria">+ Nueva Categoría</button>

        <!-- BUSCADOR -->
        <input v-model="busqueda" @input="buscar" placeholder="Buscar productos..." class="input" />

        <!-- RESULTADOS -->
        <div v-if="busqueda">

          <div v-if="resultados.length === 0">
            No hay resultados
          </div>

          <div class="grid">
            <div class="card" v-for="p in resultados" :key="p.id">
              <img :src="p.imagen || 'https://via.placeholder.com/80'" />
              <p>{{ p.nombre }}</p>
              <p>Cantidad: {{ p.cantidad }}</p>
            </div>
          </div>

        </div>

        <!-- CATEGORIAS (solo si NO estás buscando) -->
        <div v-else>



          <div class="grid">

            <div class="card" v-for="c in categorias" :key="c.id" @click="ir(c.nombre)">

              <br><br><img :src="c.imagen || 'https://via.placeholder.com/80'" />
              <p>{{ c.nombre }}</p>

            </div>

            <button class="btn-menu" @click="irMenu">
              <img src="https://cdn-icons-png.flaticon.com/128/1046/1046747.png" />
            </button>
            <br><br><br><br>
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
import { onIonViewWillEnter } from '@ionic/vue'

const busqueda = ref('')
const resultados = ref([])

const router = useRouter()

const categorias = ref([])

// CARGAR CATEGORIAS
const cargar = async () => {
  const res = await fetch('http://localhost:3000/categorias')
  categorias.value = await res.json()
}

onIonViewWillEnter(() => {
  cargar()
})

// IR A PRODUCTOS
const ir = (cat) => {
  router.push(`/tabs/productos/${cat}`)
}

// NUEVA CATEGORIA
const nuevaCategoria = () => {
  router.push('/tabs/nueva-categoria')
}

// MENU
const irMenu = () => {
  router.push('/tabs/menu')
}

let timeout = null

const buscar = () => {

  clearTimeout(timeout)

  timeout = setTimeout(async () => {

    if (!busqueda.value) {
      resultados.value = []
      return
    }

    const res = await fetch(
      `http://localhost:3000/buscar-productos?q=${busqueda.value}`
    )

    resultados.value = await res.json()

  }, 300)

}

</script>

<style>
.fondo {
  --background: white;
}

.contenedor {
  padding: 15px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  width: 550px;
  height: 600px;
  align-self: unset;
}

.card {
  border: 2px solid black;
  border-radius: 15px;
  padding: 10px;
  text-align: center;
  width: auto;
  height: 250px;
  cursor: pointer;
}

.card img {

  width: 100px;
  height: 100px;
  object-fit: contain;
}

.btn {
  width: 170%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 10px;
  background: black;
  color: white;
}

.input {
  width: 170%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: 1px solid #b0b0b0;
}

.btn-menu {
  background: white;
  border-radius: 15px;
  border: 2px solid black;
  color: black;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    width: 300px;
  }

  .btn {
    width: 95%;
  }

  .input {
    width: 95%;
  }

}
</style>
