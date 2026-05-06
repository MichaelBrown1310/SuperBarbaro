<template>
  <ion-page>
    <AppHeader titulo="ANÁLISIS DE INSUMOS" />

    <ion-content class="fondo">

      <!-- BUSCADOR -->
      <div class="top">
        <input v-model="busqueda" placeholder="Buscar insumo..." />
      </div>

      <!-- GRID -->
      <div class="grid">
        <div 
          v-for="p in filtrados" 
          :key="p.id"
          class="card"
          @click="seleccionar(p)"
        >
          <img :src="getImagen(p)" @error="imgError" />

          <h3>{{ p.nombre }}</h3>

          <p>Stock: {{ p.cantidad }}</p>

          <span :class="estadoClase(p)">
            {{ estadoTexto(p) }}
          </span>
        </div>
      </div>

      <!-- DETALLE -->
      <div v-if="producto" class="detalle">

        <button class="volver" @click="producto=null">← Volver</button>

        <h2>{{ producto.nombre }}</h2>

        <!-- GRAFICA -->
        <canvas ref="chart"></canvas>

        <!-- ANALISIS -->
        <div class="analisis">
          <p><strong>Promedio diario:</strong> {{ promedioConsumo }}</p>
          <p><strong>Variación:</strong> {{ variacionTexto }}</p>
          <p><strong>Día fuerte:</strong> {{ mejorDia }}</p>
          <p><strong>Duración stock:</strong> {{ diasRestantes }} días</p>
        </div>

        <!-- INSIGHT -->
        <div class="insight">
          {{ insight }}
        </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'

const productos = ref([])
const historico = ref([])

const busqueda = ref('')
const producto = ref(null)

const chart = ref(null)
let chartInstance = null

// TODOS LOS INSUMOS
const filtrados = computed(() =>
  productos.value.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
)

// IMAGEN
const getImagen = (p) => {
  p.imagen || 'https://via.placeholder.com/100'
}

const imgError = (e) => {
  e.target.src = 'https://via.placeholder.com/100'
}

// ESTADO
const estadoTexto = (p) => {
  if (p.cantidad < p.minimo) return 'Crítico'
  if (p.cantidad < p.minimo * 1.5) return 'Bajo'
  return 'Óptimo'
}

const estadoClase = (p) => {
  if (p.cantidad < p.minimo) return 'rojo'
  if (p.cantidad < p.minimo * 1.5) return 'amarillo'
  return 'verde'
}

// DATOS INSUMO
const datos = computed(() =>
  historico.value.filter(h => h.insumo === producto.value?.nombre)
)

// MÉTRICAS
const promedioConsumo = computed(() => {
  const vals = datos.value.map(d=>d.consumo_dia)
  if (!vals.length) return 0
  return (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)
})

const variacionTexto = computed(() => {
  const d = datos.value.map(x=>x.consumo_dia)
  if (d.length < 2) return 'Sin datos'

  const cambio = ((d[d.length-1]-d[0])/d[0])*100

  return cambio > 0 
    ? `+${cambio.toFixed(0)}% 📈` 
    : `${cambio.toFixed(0)}% 📉`
})

const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const mejorDia = computed(() => {
  const mapa = Array(7).fill(0)

  datos.value.forEach(d => {
    const dia = new Date(d.fecha).getDay()
    mapa[dia]+=d.consumo_dia
  })

  const max = Math.max(...mapa)
  return diasSemana[mapa.indexOf(max)]
})

const diasRestantes = computed(() => {
  if (!producto.value) return 0
  const stock = producto.value.cantidad
  const consumo = Number(promedioConsumo.value)
  if (!consumo) return 0
  return (stock/consumo).toFixed(1)
})

// INSIGHT REAL
const insight = computed(() => {
  if (!producto.value) return ''

  const dias = Number(diasRestantes.value)
  const variacion = parseFloat(variacionTexto.value)

  if (dias < 2)
    return "Inventario crítico. El ritmo de consumo actual agotará el stock muy pronto."

  if (variacion > 20)
    return "El consumo está creciendo rápidamente. Este insumo podría convertirse en cuello de botella."

  if (variacion < -20)
    return "El consumo está disminuyendo. Puede haber sobrestock o menor demanda."

  return "El comportamiento del insumo es estable en el tiempo."
})

// GRAFICA BONITA
const crearGrafica = async () => {
  await nextTick()

  const labels = datos.value.map(d => d.fecha)
  const valores = datos.value.map(d => d.consumo_dia)

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(chart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Consumo',
        data: valores,
        fill: true,
        tension: 0.4
      }]
    }
  })
}

const seleccionar = async (p) => {
  producto.value = p
  await crearGrafica()
}

// 🔌 LOAD
onMounted(async () => {
  const p = await axios.get('http://localhost:3000/api/insumos/productos')
  const h = await axios.get('http://localhost:3000/api/insumos/historico')

  productos.value = p.data
  historico.value = h.data
})
</script>

<style scoped>
.fondo { --background:#f4f6f9; color:#111 }

input {
  width:100%;
  padding:12px;
  border-radius:12px;
  border:1px solid #ccc;
  color:#111;
}

.grid {
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(160px,1fr));
  gap:12px;
  padding:12px;
}

.card {
  background:white;
  border-radius:14px;
  padding:12px;
  text-align:center;
  box-shadow:0 4px 10px rgba(0,0,0,0.08);
  color: black;
}

.card img {
  width:80px;
  height:80px;
  object-fit:cover;
  border-radius:10px;
}

.detalle {
  padding:12px;
  color: black;
}

.analisis {
  margin-top:10px;
  background:white;
  padding:10px;
  border-radius:10px;
  color: black;
}

.insight {
  margin-top:10px;
  background:#fff;
  padding:12px;
  border-radius:10px;
  font-weight:500;
}

.rojo { color:#e53935 }
.amarillo { color:#fbc02d }
.verde { color:#43a047 }
</style>