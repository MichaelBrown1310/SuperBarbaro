<template>

  <ion-page>

    <AppHeader titulo="MENÚ" />

    <ion-content class="fondo">
        <br>
      <!-- BUSCADOR CENTRADO -->
      <div class="busqueda-box">
        <input 
          v-model="busqueda" 
          placeholder="Buscar..." 
          class="input-busqueda" 
        />
      </div>

      <!-- SECCIONES POR CATEGORIA -->
      <div v-for="(items, categoria) in menuAgrupado" :key="categoria">

        <h2 class="titulo-categoria">
          {{ categoria }}
        </h2>

        <div class="menu-container">

          <div 
            class="menu-card" 
            v-for="item in items" 
            :key="item.id"
          >
            <img :src="item.imagen || 'https://via.placeholder.com/80'" />

            <h3>
              <span class="categoria"> {{ item.nombre }} </span>
            </h3>

            <strong>${{ Number(item.precio).toLocaleString() }}</strong>

            <p>{{ item.descripcion }}</p>

          </div>

        </div>

      </div>

      <br><br><br><br><br>

    </ion-content>

  </ion-page>

</template>

<script setup>
import { ref, computed } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'

const busqueda = ref('')
const menu = ref([])

// FILTRO
const menuFiltrado = computed(() => {
  if (!busqueda.value) return menu.value

  const texto = busqueda.value.toLowerCase()

  return menu.value.filter(item =>
    item.nombre.toLowerCase().includes(texto) ||
    item.categoria_nombre.toLowerCase().includes(texto)
  )
})

// AGRUPAR POR CATEGORIA
const menuAgrupado = computed(() => {
  const grupos = {}

  menuFiltrado.value.forEach(item => {
    const cat = item.categoria_nombre || 'otros'

    if (!grupos[cat]) {
      grupos[cat] = []
    }

    grupos[cat].push(item)
  })

  return grupos
})

// CARGAR DATOS
const cargarMenu = async () => {
  try {
    const res = await fetch('http://localhost:3000/menu')
    const data = await res.json()

    console.log('MENU:', data)

    menu.value = data
  } catch (error) {
    console.error('Error cargando menú:', error)
  }
}

onIonViewWillEnter(cargarMenu)
</script>

<style>
.menu-container {
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  color:black;
}

/* CENTRAR BUSCADOR */
.busqueda-box {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.input-busqueda {
  width: 100%;
  max-width: 650px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #020202;
  color: #393939;
  background: rgb(239, 236, 236);
}

/* TARJETAS */
.menu-card {
  border: 2px solid #000;
  border-radius: 15px;
  padding: 10px;
  text-align: center;
  color: black;
}

.menu-card img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

/* NOMBRE */
.categoria {
  font-size: 20px;
  color: rgb(0, 0, 0);
  display: block;
  font-weight: bold;
}

/* TITULO DE SECCION */
.titulo-categoria {
  margin-top: 20px;
  margin-left: 15px;
  font-size: 18px;
  font-weight: bold;
  text-transform: capitalize;
  color: black;
}

@media (max-width: 600px) {

.input-busqueda{
    max-width: 500px;
}

}
</style>