<template>
  <ion-page>
    <AppHeader titulo="PREDICCIÓN DE INSUMOS" :mostrarVolver="true" />

    <ion-content class="fondo">
      <div class="contenedor">

        <!-- KPIs -->
        <div class="kpis">
          <div class="kpi-card gris">
            <span class="kpi-icono">📦</span>
            <span class="kpi-label">Consumo diario est.</span>
            <span class="kpi-valor">{{ demandaTotal }} und</span>
            <span class="kpi-sub">Promedio basado en historial</span>
          </div>
          <div class="kpi-card verde">
            <span class="kpi-icono">✅</span>
            <span class="kpi-label">Salud inventario</span>
            <span class="kpi-valor">{{ porcentajeSalud }}%</span>
            <span class="kpi-sub">Productos con stock estable</span>
          </div>
          <div class="kpi-card rojo">
            <span class="kpi-icono">⚠️</span>
            <span class="kpi-label">Alertas</span>
            <span class="kpi-valor">{{ alertas }}</span>
            <span class="kpi-sub">Insumos que requieren atención</span>
          </div>
        </div>

        <!-- BUSCADOR + EXPORTAR -->
        <div class="barra-acciones">
          <div class="buscador-wrap">
            <ion-icon name="search-outline" class="search-icon" />
            <input v-model="busqueda" placeholder="Buscar insumo..." />
          </div>
          <button class="btn-exportar" @click="exportarPDF" :disabled="exportando">
            <ion-icon name="document-text-outline" />
            <span>{{ exportando ? 'Generando...' : 'PDF' }}</span>
          </button>
        </div>

        <!-- GRID -->
        <div class="grid" v-if="!producto">
          <div v-for="p in filtrados" :key="p.id" class="card" @click="seleccionar(p)">
            <div class="card-header">
              <img :src="p.imagen || 'https://placehold.co/80x80/f0f0f0/999?text=📦'" />
              <span class="badge" :class="estadoClase(p)">{{ recomendacion(p) }}</span>
            </div>
            <h3>{{ p.nombre }}</h3>
            <div class="info">
              <div class="info-fila">
                <span class="info-label">Stock</span>
                <span class="info-val">{{ p.cantidad }} und</span>
              </div>
              <div class="info-fila">
                <span class="info-label">Consumo/día</span>
                <span class="info-val">{{ getConsumo(p) }} und</span>
              </div>
              <div class="info-fila">
                <span class="info-label">Duración</span>
                <span class="info-val" :class="estadoClase(p)">{{ calcularDias(p) }} días</span>
              </div>
            </div>
            <div class="barra-wrap">
              <div class="barra-progreso" :class="estadoClase(p)" :style="{ width: anchoBarra(p) + '%' }" />
            </div>
          </div>
        </div>

        <!-- DETALLE -->
        <div v-if="producto" class="detalle">
          <div class="detalle-header">
            <button class="btn-volver" @click="producto = null">
              <ion-icon name="arrow-back-outline" /> Volver
            </button>
          </div>

          <div class="detalle-card">
            <h2 class="detalle-nombre">{{ producto.nombre }}</h2>
            <div class="grafica-container">
              <canvas ref="chart"></canvas>
            </div>
            <div class="analisis-grid">
              <div class="analisis-item">
                <span class="analisis-label">Consumo promedio</span>
                <span class="analisis-val">{{ promedioConsumo }} und/día</span>
              </div>
              <div class="analisis-item">
                <span class="analisis-label">Tendencia</span>
                <span class="analisis-val" :class="variacionTexto.includes('+') ? 'color-rojo' : 'color-verde'">
                  {{ variacionTexto }}
                </span>
              </div>
              <div class="analisis-item">
                <span class="analisis-label">Mayor consumo</span>
                <span class="analisis-val">{{ mejorDia }}</span>
              </div>
              <div class="analisis-item">
                <span class="analisis-label">Duración estimada</span>
                <span class="analisis-val" :class="Number(diasRestantes) < 3 ? 'color-rojo' : 'color-verde'">
                  {{ diasRestantes }} días
                </span>
              </div>
            </div>
            <div class="insight-box" :class="claseInsight">
              💡 {{ insight }}
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { addIcons } from 'ionicons'
import { searchOutline, documentTextOutline, arrowBackOutline } from 'ionicons/icons'
import AppHeader from '@/components/AppHeader.vue'

addIcons({
  'search-outline': searchOutline,
  'document-text-outline': documentTextOutline,
  'arrow-back-outline': arrowBackOutline
})

const API_URL = 'https://superbarbaro.onrender.com'

const productos = ref([])
const historico = ref([])
const busqueda = ref('')
const producto = ref(null)
const chart = ref(null)
const exportando = ref(false)
let chartInstance = null

const limpiarTexto = (txt) => String(txt || '').trim().toLowerCase()

const filtrados = computed(() =>
  productos.value.filter(p => limpiarTexto(p.nombre).includes(limpiarTexto(busqueda.value)))
)

const estadoClase = (p) => {
  const dias = Number(calcularDias(p))
  if (isNaN(dias)) return 'gris'
  if (dias < 2) return 'rojo'
  if (dias < 5) return 'amarillo'
  return 'verde'
}

const datos = computed(() => {
  if (!producto.value) return []
  return historico.value.filter(h => limpiarTexto(h.insumo) === limpiarTexto(producto.value.nombre))
})

const promedioConsumo = computed(() => {
  const vals = datos.value.map(d => Number(d.consumo_dia)).filter(v => !isNaN(v))
  if (!vals.length) return 'Sin datos'
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
})

const variacionTexto = computed(() => {
  const d = datos.value.map(x => Number(x.consumo_dia)).filter(v => !isNaN(v))
  if (d.length < 2 || d[0] === 0) return 'Sin datos'
  const cambio = ((d[d.length - 1] - d[0]) / d[0]) * 100
  return cambio > 0 ? `+${cambio.toFixed(0)}% 📈` : `${cambio.toFixed(0)}% 📉`
})

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const mejorDia = computed(() => {
  if (!datos.value.length) return 'Sin registros'
  const mapa = Array(7).fill(0)
  datos.value.forEach(d => {
    const fecha = new Date(d.fecha)
    if (!isNaN(fecha)) mapa[fecha.getDay()] += Number(d.consumo_dia) || 0
  })
  const max = Math.max(...mapa)
  return max <= 0 ? 'Sin consumo' : diasSemana[mapa.indexOf(max)]
})

const diasRestantes = computed(() => {
  if (!producto.value) return 'Sin datos'
  const consumo = Number(promedioConsumo.value)
  if (!consumo || isNaN(consumo)) return 'Sin datos'
  return (Number(producto.value.cantidad) / consumo).toFixed(1)
})

const insight = computed(() => {
  const dias = Number(diasRestantes.value)
  if (isNaN(dias)) return 'No hay suficiente historial para generar análisis.'
  if (dias < 2) return 'Inventario crítico. El stock podría agotarse muy pronto.'
  if (dias < 5) return 'Stock bajo. Se recomienda reabastecer pronto.'
  if (dias < 10) return 'Inventario estable, pero debe monitorearse.'
  return 'El inventario tiene una cobertura saludable.'
})

const claseInsight = computed(() => {
  const dias = Number(diasRestantes.value)
  if (isNaN(dias)) return 'gris'
  if (dias < 2) return 'rojo'
  if (dias < 5) return 'amarillo'
  return 'verde'
})

const getConsumo = (p) => {
  const d = historico.value.filter(h => limpiarTexto(h.insumo) === limpiarTexto(p.nombre))
  const vals = d.map(x => Number(x.consumo_dia)).filter(v => !isNaN(v))
  if (!vals.length) return 0
  return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1))
}

const calcularDias = (p) => {
  const consumo = getConsumo(p)
  if (!consumo) return 'Sin datos'
  return (p.cantidad / consumo).toFixed(1)
}

const anchoBarra = (p) => {
  const dias = Number(calcularDias(p))
  return isNaN(dias) ? 0 : Math.min((dias / 15) * 100, 100)
}

const alertas = computed(() => productos.value.filter(p => {
  const dias = Number(calcularDias(p))
  return !isNaN(dias) && dias < 5
}).length)

const demandaTotal = computed(() =>
  productos.value.reduce((acc, p) => acc + Number(getConsumo(p)), 0).toFixed(0)
)

const porcentajeSalud = computed(() => {
  const total = productos.value.length
  if (!total) return 0
  return ((productos.value.filter(p => Number(calcularDias(p)) >= 5).length / total) * 100).toFixed(0)
})

const recomendacion = (p) => {
  const dias = Number(calcularDias(p))
  if (isNaN(dias)) return 'Sin datos'
  if (dias < 2) return 'Urgente'
  if (dias < 5) return 'Reponer'
  return 'Stock OK'
}

const crearGrafica = async () => {
  await nextTick()
  if (!chart.value) return
  const labels = datos.value.map(d => d.fecha)
  const valores = datos.value.map(d => Number(d.consumo_dia))
  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(chart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Consumo diario',
        data: valores,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        borderColor: '#ff7a00',
        backgroundColor: 'rgba(255,122,0,0.1)'
      }]
    },
    options: { responsive: true, plugins: { legend: { display: true } } }
  })
}

const seleccionar = async (p) => {
  producto.value = p
  await crearGrafica()
}

// ── EXPORTAR PDF ──
const exportarPDF = async () => {
  exportando.value = true
  try {
    const fecha = new Date().toLocaleDateString('es-CO')
    const filas = filtrados.value.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>${getConsumo(p)}</td>
        <td>${calcularDias(p)}</td>
        <td style="color:${estadoClase(p) === 'rojo' ? '#e53935' : estadoClase(p) === 'amarillo' ? '#fbc02d' : '#43a047'};font-weight:700">${recomendacion(p)}</td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #888; font-size: 13px; margin-bottom: 20px; }
        .kpis { display: flex; gap: 16px; margin-bottom: 24px; }
        .kpi { flex:1; border: 2px solid #eee; border-radius: 12px; padding: 12px; text-align: center; }
        .kpi h2 { margin: 4px 0; font-size: 24px; }
        .kpi p { margin: 0; font-size: 12px; color: #888; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #1a1a1a; color: white; padding: 10px 12px; text-align: left; }
        td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; }
        tr:nth-child(even) td { background: #fafafa; }
        .footer { margin-top: 30px; font-size: 11px; color: #aaa; text-align: center; }
        .acento { color: #ff7a00; font-weight: 800; }
      </style></head><body>
      <h1>🍔 <span class="acento">SuperBárbaro</span> — Reporte de Insumos</h1>
      <p class="sub">Generado el ${fecha} · Consumo diario y duración estimada del inventario</p>
      <div class="kpis">
        <div class="kpi"><p>Consumo diario total</p><h2>${demandaTotal.value} und</h2></div>
        <div class="kpi"><p>Salud del inventario</p><h2>${porcentajeSalud.value}%</h2></div>
        <div class="kpi"><p>Alertas activas</p><h2 style="color:#e53935">${alertas.value}</h2></div>
      </div>
      <table>
        <thead><tr><th>Insumo</th><th>Stock</th><th>Consumo/día</th><th>Duración</th><th>Estado</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <p class="footer">SuperBárbaro · Sistema de gestión de food truck · ${fecha}</p>
      </body></html>
    `

    const ventana = window.open('', '_blank')
    ventana.document.write(html)
    ventana.document.close()
    ventana.focus()
    setTimeout(() => { ventana.print(); ventana.close() }, 500)
  } finally {
    exportando.value = false
  }
}

onMounted(async () => {
  try {
    const p = await axios.get(`${API_URL}/api/insumos/productos`)
    const h = await axios.get(`${API_URL}/api/insumos/historico`)
    productos.value = p.data || []
    historico.value = h.data || []
  } catch {}
})
</script>

<style scoped>
.fondo {
  --background: #f7f7f7;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

.contenedor {
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── KPIs ── */
.kpis { display: flex; gap: 10px; }

.kpi-card {
  flex: 1;
  background: white;
  border-radius: 14px;
  padding: 12px 10px;
  text-align: center;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kpi-card.gris  { border-color: #757575; }
.kpi-card.verde { border-color: #4caf50; }
.kpi-card.rojo  { border-color: #f44336; }

.kpi-icono { font-size: 18px; }
.kpi-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
.kpi-valor { font-size: 20px; font-weight: 900; color: black; }
.kpi-sub   { font-size: 9px; color: #bbb; line-height: 1.3; }

/* ── Barra acciones ── */
.barra-acciones {
  display: flex;
  gap: 10px;
  align-items: center;
}

.buscador-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid black;
  border-radius: 14px;
  padding: 10px 14px;
}

.search-icon { font-size: 16px; color: #888; flex-shrink: 0; }

.buscador-wrap input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  background: transparent;
  color: black;
}

.btn-exportar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ff7a00;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.btn-exportar:disabled { opacity: 0.6; }

/* ── Grid ── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.card {
  background: white;
  border: 2px solid black;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.1s;
}

.card:active { transform: scale(0.97); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.card-header img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
}

.badge {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
}

.badge.verde   { background: #e8f5e9; color: #43a047; }
.badge.amarillo{ background: #fff8e1; color: #f9a825; }
.badge.rojo    { background: #ffebee; color: #e53935; }
.badge.gris    { background: #eeeeee; color: #757575; }

.card h3 { font-size: 13px; font-weight: 800; margin-bottom: 8px; color: black; }

.info { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }

.info-fila {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.info-label { color: #999; }
.info-val   { font-weight: 700; color: #333; }

.info-val.verde   { color: #43a047; }
.info-val.amarillo{ color: #f9a825; }
.info-val.rojo    { color: #e53935; }
.info-val.gris    { color: #757575; }

.barra-wrap {
  height: 6px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.barra-progreso {
  height: 100%;
  border-radius: 10px;
  transition: width 0.4s ease;
}

.barra-progreso.verde   { background: #4caf50; }
.barra-progreso.amarillo{ background: #fbc02d; }
.barra-progreso.rojo    { background: #f44336; }
.barra-progreso.gris    { background: #9e9e9e; }

/* ── Detalle ── */
.detalle { display: flex; flex-direction: column; gap: 14px; }

.btn-volver {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 2px solid black;
  border-radius: 12px;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  color: black;
  width: fit-content;
}

.detalle-card {
  background: white;
  border: 2px solid black;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detalle-nombre { font-size: 18px; font-weight: 900; margin: 0; }

.grafica-container {
  background: #fafafa;
  border-radius: 12px;
  padding: 10px;
}

.analisis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.analisis-item {
  background: #f7f7f7;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.analisis-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
.analisis-val   { font-size: 14px; font-weight: 800; color: black; }
.color-verde { color: #43a047; }
.color-rojo  { color: #e53935; }

.insight-box {
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 600;
  font-size: 13px;
}

.insight-box.verde   { background: #e8f5e9; color: #2e7d32; }
.insight-box.amarillo{ background: #fff8e1; color: #f57f17; }
.insight-box.rojo    { background: #ffebee; color: #c62828; }
.insight-box.gris    { background: #eeeeee; color: #616161; }
</style>
