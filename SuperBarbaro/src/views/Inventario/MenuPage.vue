<template>
  <ion-page>
    <AppHeader titulo="MENÚ" />

    <ion-content class="fondo">

      <br>

      <div class="contenedor-principal">

        <!-- BOTON -->
        <div class="contenedor-boton">
          <button v-if="esAdmin()" class="btn-principal" @click="irNuevo">
            + Nuevo Plato
          </button>
        </div>

        <!-- BUSCADOR -->
        <div class="busqueda-box">
          <input v-model="busqueda" placeholder="Buscar..." class="input-busqueda" />
        </div>

      </div>

      <!-- CATEGORIAS -->
      <div v-for="(items, categoria) in menuAgrupado" :key="categoria">

        <!-- TITULO CATEGORIA -->
        <h2 class="titulo-categoria">
          {{ categoria }}
        </h2>

        <div class="menu-container">

          <div class="menu-card" v-for="item in items" :key="item.id">

            <!-- EDITAR -->
            <img
              v-if="esAdmin()"
              src="https://cdn-icons-png.flaticon.com/128/1827/1827933.png"
              class="icono-editar"
              @click="editar(item.id)"
            />

            <img :src="item.imagen || 'https://via.placeholder.com/80'" />

            <h3 class="nombre">{{ item.nombre }}</h3>

            <strong class="precio">
              ${{ Number(item.precio).toLocaleString() }}
            </strong>

            <p class="descripcion">{{ item.descripcion }}</p>

          </div>

        </div>

      </div>

      <br><br><br>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'
import { useRouter } from 'vue-router'
import { esAdmin } from '@/utils/auth'

const router = useRouter()

const irNuevo = () => router.push('/nuevo-menu')
const editar = (id) => router.push(`/editar-menu/${id}`)

const busqueda = ref('')
const menu = ref([])

const menuFiltrado = computed(() => {
  if (!busqueda.value) return menu.value

  const texto = busqueda.value.toLowerCase()

  return menu.value.filter(item =>
    item.nombre.toLowerCase().includes(texto) ||
    item.categoria_nombre.toLowerCase().includes(texto)
  )
})

const menuAgrupado = computed(() => {
  const grupos = {}

  menuFiltrado.value.forEach(item => {
    const cat = item.categoria_nombre || 'Otros'

    if (!grupos[cat]) grupos[cat] = []

    grupos[cat].push(item)
  })

  return grupos
})

const cargarMenu = async () => {
  const res = await fetch('http://localhost:3000/menu')
  menu.value = await res.json()
}

onIonViewWillEnter(cargarMenu)
</script>

<style>
/* CONTENEDOR GENERAL */
.contenedor-principal {
  padding: 0 15px;
}

/* BOTON */
.contenedor-boton {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.btn-principal {
  background: black;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  max-width: 650px;
}

/* BUSCADOR */
.busqueda-box {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.input-busqueda {
  width: 90%;
  max-width: 650px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #000;
  background: #efefef;
}

/* TITULO CATEGORIA */
.titulo-categoria {
  margin: 20px 15px 10px;
  font-size: 18px;
  font-weight: bold;
  text-transform: capitalize;
  color: black;
  border-bottom: 2px solid #000;
  padding-bottom: 5px;
}

/* GRID */
.menu-container {
  padding: 15px 30px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

/* CARD */
.menu-card {
  border: 2px solid #000;
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  position: relative;
  background: white;
  color: black;
}

/* IMAGENES */
.menu-card img:not(.icono-editar) {
  width: 80px;
  height: 80px;
}

/* ICONO */
.icono-editar {
  width: 16px;
  height: 16px;
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.icono-editar:hover {
  transform: scale(1.1);
}

/* TEXTOS */
.nombre {
  font-weight: bold;
}

.precio {
  display: block;
  margin: 5px 0;
}
</style>