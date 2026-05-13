<template>
  <ion-page>
    <AppHeader titulo="ANÁLISIS DE INSUMOS" />

    <ion-content class="fondo">

      <!-- RESUMEN -->
      <div class="resumen">

        <div class="card-resumen gris">
          <p class="titulo">Consumo diario estimado</p>
          <h2>{{ demandaTotal }} und</h2>
          <span class="desc">
            Promedio diario total basado en historial
          </span>
        </div>

        <div class="card-resumen verde">
          <p class="titulo">Salud inventario</p>
          <h2>{{ porcentajeSalud }}%</h2>
          <span class="desc">
            Productos con stock estable
          </span>
        </div>

        <div class="card-resumen rojo">
          <p class="titulo">Alertas</p>
          <h2>{{ alertas }}</h2>
          <span class="desc">
            Insumos que requieren atención
          </span>
        </div>

      </div>

      <!-- BUSCADOR -->
      <div class="top">
        <input v-model="busqueda" placeholder="Buscar insumo..." />
        <div class="dropdown-exportar">
          <button class="btn-exportar" @click="mostrarMenu = !mostrarMenu" :disabled="exportando">
            <ion-icon name="document-text-outline" />
            <span>{{ exportando ? 'Generando...' : 'Exportar ▾' }}</span>
          </button>

          <div v-if="mostrarMenu" class="menu-exportar">
            <button @click="exportarArchivo('pdf')">📄 PDF</button>
            <button @click="exportarArchivo('excel')">📊 Excel</button>
            <button @click="exportarArchivo('word')">📝 Word</button>
            <button @click="exportarArchivo('csv')">📑 CSV</button>
          </div>
        </div>
      </div>

      <!-- GRID -->
      <div class="grid">

        <div v-for="p in filtrados" :key="p.id" class="card" @click="seleccionar(p)">

          <img :src="p.imagen || 'https://via.placeholder.com/100'" />

          <h3>{{ p.nombre }}</h3>

          <div class="info">

            <p>
              <strong>📦 Stock:</strong>
              {{ p.cantidad }}
            </p>

            <p>
              <strong>📉 Consumo:</strong>
              {{ getConsumo(p) }} und/día
            </p>

            <p>
              <strong>⏳ Duración:</strong>
              {{ calcularDias(p) }} días
            </p>

          </div>

          <!-- BARRA -->
          <div class="barra">

            <div class="progreso" :class="estadoClase(p)" :style="{ width: anchoBarra(p) + '%' }"></div>

          </div>

          <!-- BADGE -->
          <span class="badge" :class="estadoClase(p)">
            {{ recomendacion(p) }}
          </span>

        </div>

      </div>

      <!-- DETALLE -->
      <div v-if="producto" class="detalle">

        <button class="volver" @click="producto = null">
          ← Volver
        </button>

        <h2>{{ producto.nombre }}</h2>

        <!-- GRAFICA -->
        <div class="grafica-container">
          <canvas ref="chart"></canvas>
        </div>

        <!-- ANALISIS -->
        <div class="analisis">

          <h3>📊 Análisis del insumo</h3>

          <p>
            <strong>Consumo promedio diario:</strong>
            {{ promedioConsumo }} und
          </p>

          <p>
            <strong>Tendencia:</strong>

            <span :class="variacionTexto.includes('+')
              ? 'rojo'
              : 'verde'
              ">
              {{ variacionTexto }}
            </span>
          </p>

          <p>
            <strong>Día con mayor consumo:</strong>
            {{ mejorDia }}
          </p>

          <p>
            <strong>Duración estimada:</strong>

            <span :class="Number(diasRestantes) < 3
              ? 'rojo'
              : 'verde'
              ">
              {{ diasRestantes }} días
            </span>
          </p>

        </div>

        <!-- INSIGHT -->
        <div class="insight" :class="claseInsight">
          💡 {{ insight }}
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

const API_URL = 'https://superbarbaro.onrender.com'

const productos = ref([])
const historico = ref([])

const busqueda = ref('')
const producto = ref(null)

const chart = ref(null)

const exportando = ref(false)
const mostrarMenu = ref(false)

let chartInstance = null

// LIMPIAR TEXTO
const limpiarTexto = (txt) => String(txt || '').trim().toLowerCase()

const formatearFecha = (valor) => {
  const fecha = new Date(valor)

  if (isNaN(fecha))
    return valor

  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// FILTRO
const filtrados = computed(() =>
  productos.value.filter(p =>
    limpiarTexto(p.nombre)
      .includes(
        limpiarTexto(busqueda.value)
      )
  )
)

// ESTADO
const estadoClase = (p) => {
  const dias = Number(calcularDias(p))
  if (isNaN(dias)) return 'gris'
  if (dias < 2) return 'rojo'
  if (dias < 5) return 'amarillo'
  return 'verde'
}

// DATOS DEL PRODUCTO
const datos = computed(() => {

  if (!producto.value)
    return []

  return historico.value.filter(h => limpiarTexto(h.insumo) === limpiarTexto(producto.value.nombre)
  )
})

// PROMEDIO
const promedioConsumo = computed(() => {

  const vals = datos.value
    .map(d => Number(d.consumo_dia))
    .filter(v => !isNaN(v))

  if (!vals.length)
    return 'Sin datos'

  const promedio =
    vals.reduce((a, b) => a + b, 0) /
    vals.length

  return promedio.toFixed(1)
})

// VARIACIÓN
const variacionTexto = computed(() => {

  const d = datos.value
    .map(x => Number(x.consumo_dia))
    .filter(v => !isNaN(v))

  if (d.length < 2)
    return 'Sin datos'

  if (d[0] === 0)
    return 'Sin datos'

  const cambio =
    ((d[d.length - 1] - d[0]) / d[0]) * 100

  return cambio > 0
    ? `+${cambio.toFixed(0)}% 📈`
    : `${cambio.toFixed(0)}% 📉`
})

// DÍAS
const diasSemana = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
]

// MEJOR DÍA
const mejorDia = computed(() => {

  if (!datos.value.length)
    return 'Sin registros'

  const mapa = Array(7).fill(0)

  datos.value.forEach(d => {

    const fecha = new Date(d.fecha)

    if (isNaN(fecha))
      return

    const dia = fecha.getDay()

    mapa[dia] +=
      Number(d.consumo_dia) || 0
  })

  const max = Math.max(...mapa)

  if (max <= 0)
    return 'Sin consumo'

  return diasSemana[
    mapa.indexOf(max)
  ]
})

// DURACIÓN
const diasRestantes = computed(() => {

  if (!producto.value)
    return 'Sin datos'

  const stock =
    Number(producto.value.cantidad)

  const consumo =
    Number(promedioConsumo.value)

  if (
    !consumo ||
    isNaN(consumo)
  )
    return 'Sin datos'

  return (stock / consumo).toFixed(1)
})

// INSIGHT
const insight = computed(() => {

  if (!producto.value)
    return ''

  const dias =
    Number(diasRestantes.value)

  if (isNaN(dias))
    return 'No hay suficiente historial registrado para generar análisis.'

  if (dias < 2)
    return 'Inventario crítico. El stock podría agotarse muy pronto.'

  if (dias < 5)
    return 'Stock bajo. Se recomienda reabastecer pronto.'

  if (dias < 10)
    return 'Inventario estable, pero debe monitorearse.'

  return 'El inventario tiene una cobertura saludable.'
})

// CLASE INSIGHT
const claseInsight = computed(() => {

  const dias =
    Number(diasRestantes.value)

  if (isNaN(dias))
    return 'gris'

  if (dias < 2)
    return 'rojo'

  if (dias < 5)
    return 'amarillo'

  return 'verde'
})

// GRAFICA
const crearGrafica = async () => {

  await nextTick()

  if (!chart.value)
    return

  const labels = datos.value.map(d => formatearFecha(d.fecha))

  const valores = datos.value.map(d =>
    Number(d.consumo_dia)
  )

  if (chartInstance)
    chartInstance.destroy()

  chartInstance = new Chart(chart.value, {

    type: 'line',

    data: {
      labels,

      datasets: [{
        label: 'Consumo diario',
        data: valores,
        fill: true,
        tension: 0.4,
        borderWidth: 3
      }]
    },

    options: {

      responsive: true,

      plugins: {

        legend: {
          display: true
        }
      }
    }
  })
}

// SELECCIONAR
const seleccionar = async (p) => {

  producto.value = p

  await crearGrafica()
}


// Se ejecuta al seleccionar una opción del menú
const exportarArchivo = async (tipo) => {
  // Cerrar el menú
  mostrarMenu.value = false

  // Llamar a la función de exportación con el tipo seleccionado
  await exportarPDF(tipo)
}

// ── EXPORTAR ARCHIVOS (PDF, CSV, EXCEL, WORD) ──
const exportarPDF = async (tipo = 'pdf') => {
  exportando.value = true

  try {
    // Datos a exportar
    const filas = productos.value.map(p => ({
      nombre: p.nombre,
      stock: p.cantidad,
      consumoDiario: getConsumo(p),
      diasEstimados: calcularDias(p),
      estado: recomendacion(p)
    }))

    // Fecha para el nombre del archivo
    const fecha = new Date().toISOString().slice(0, 10)

    // Función auxiliar para descargar
    const descargarArchivo = (contenido, nombre, mimeType) => {
      const blob = new Blob([contenido], { type: mimeType })
      const url = URL.createObjectURL(blob)

      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = nombre
      enlace.style.display = 'none'

      document.body.appendChild(enlace)
      enlace.click()
      document.body.removeChild(enlace)

      URL.revokeObjectURL(url)
    }

    // =========================
    // CSV
    // =========================
    if (tipo === 'csv') {
      let csv = 'Insumo,Stock,Consumo Diario,Días Estimados,Estado\n'

      filas.forEach(f => {
        csv += `"${f.nombre}",${f.stock},${f.consumoDiario},${f.diasEstimados},"${f.estado}"\n`
      })

      descargarArchivo(
        csv,
        `analisis_insumos_${fecha}.csv`,
        'text/csv;charset=utf-8;'
      )

      return
    }

    // =========================
    // EXCEL (.xls)
    // =========================
    if (tipo === 'excel') {
      let tabla = `
        <table border="1">
          <tr>
            <th>Insumo</th>
            <th>Stock</th>
            <th>Consumo Diario</th>
            <th>Días Estimados</th>
            <th>Estado</th>
          </tr>
      `

      filas.forEach(f => {
        tabla += `
          <tr>
            <td>${f.nombre}</td>
            <td>${f.stock}</td>
            <td>${f.consumoDiario}</td>
            <td>${f.diasEstimados}</td>
            <td>${f.estado}</td>
          </tr>
        `
      })

      tabla += '</table>'

      descargarArchivo(
        tabla,
        `analisis_insumos_${fecha}.xls`,
        'application/vnd.ms-excel'
      )

      return
    }

    // =========================
    // WORD (.doc)
    // =========================
    if (tipo === 'word') {
      let htmlWord = `
        <html>
        <head>
          <meta charset="utf-8">
          <title>Análisis de Insumos</title>
        </head>
        <body>
          <h1>Análisis de Insumos</h1>
          <table border="1" cellspacing="0" cellpadding="6">
            <tr>
              <th>Insumo</th>
              <th>Stock</th>
              <th>Consumo Diario</th>
              <th>Días Estimados</th>
              <th>Estado</th>
            </tr>
      `

      filas.forEach(f => {
        htmlWord += `
          <tr>
            <td>${f.nombre}</td>
            <td>${f.stock}</td>
            <td>${f.consumoDiario}</td>
            <td>${f.diasEstimados}</td>
            <td>${f.estado}</td>
          </tr>
        `
      })

      htmlWord += `
          </table>
        </body>
        </html>
      `

      descargarArchivo(
        htmlWord,
        `analisis_insumos_${fecha}.doc`,
        'application/msword'
      )

      return
    }

    // =========================
    // PDF (descarga como HTML listo para imprimir)
    // =========================
    let htmlPdf = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>Análisis de Insumos</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
          }

          h1 {
            text-align: center;
            color: #2e7d32;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #2e7d32;
            color: white;
          }
        </style>
      </head>
      <body>
        <h1>Análisis de Insumos</h1>
        <p>Fecha: ${new Date().toLocaleDateString('es-CO')}</p>

        <table>
          <tr>
            <th>Insumo</th>
            <th>Stock</th>
            <th>Consumo Diario</th>
            <th>Días Estimados</th>
            <th>Estado</th>
          </tr>
    `

    filas.forEach(f => {
      htmlPdf += `
        <tr>
          <td>${f.nombre}</td>
          <td>${f.stock}</td>
          <td>${f.consumoDiario}</td>
          <td>${f.diasEstimados}</td>
          <td>${f.estado}</td>
        </tr>
      `
    })

    htmlPdf += `
        </table>
      </body>
      </html>
    `

    descargarArchivo(
      htmlPdf,
      `analisis_insumos_${fecha}.html`,
      'text/html;charset=utf-8;'
    )

    alert(
      'Se descargó un archivo HTML. Ábrelo en tu navegador y selecciona "Imprimir > Guardar como PDF".'
    )

  } catch (error) {
    console.error('Error al exportar:', error)
    alert('Ocurrió un error al exportar el archivo.')
  } finally {
    exportando.value = false
  }
}
// LOAD
onMounted(async () => {

  try {

    const p = await axios.get(
      `${API_URL}/api/insumos/productos`
    )

    const h = await axios.get(
      `${API_URL}/api/insumos/historico`
    )

    productos.value = p.data || []
    console.log(productos.value)
    historico.value = h.data || []

  } catch (error) {

    console.error(
      'Error cargando datos:',
      error
    )
  }
})

// CONSUMO
const getConsumo = (p) => {

  const d = historico.value.filter(h =>

    limpiarTexto(h.insumo) ===
    limpiarTexto(p.nombre)
  )

  if (!d.length)
    return 0

  const vals = d

    .map(x =>
      Number(x.consumo_dia)
    )

    .filter(v =>
      !isNaN(v)
    )

  if (!vals.length)
    return 0

  const promedio =

    vals.reduce((a, b) => a + b, 0) /
    vals.length

  return Number(
    promedio.toFixed(1)
  )
}

// DIAS ESTIMADOS
const calcularDias = (p) => {

  const consumo = getConsumo(p)

  if (!consumo)
    return 'Sin datos'

  return (
    p.cantidad / consumo
  ).toFixed(1)
}

// BARRA
const anchoBarra = (p) => {

  const dias =
    Number(calcularDias(p))

  if (isNaN(dias))
    return 0

  return Math.min(
    (dias / 15) * 100,
    100
  )
}

// ALERTAS
const alertas = computed(() =>

  productos.value.filter(p => {

    const dias =
      Number(calcularDias(p))

    return !isNaN(dias) && dias < 5

  }).length
)

// DEMANDA
const demandaTotal = computed(() => {

  const total = productos.value.reduce(
    (acc, p) =>

      acc + Number(
        getConsumo(p)
      ),

    0
  )

  return total.toFixed(0)
})

// SALUD
const porcentajeSalud = computed(() => {

  const total =
    productos.value.length

  if (!total)
    return 0

  const saludables =
    productos.value.filter(p => {

      const dias =
        Number(calcularDias(p))

      return dias >= 5
    }).length

  return (
    (saludables / total) * 100
  ).toFixed(0)
})

// RECOMENDACIÓN
const recomendacion = (p) => {

  const dias =
    Number(calcularDias(p))

  if (isNaN(dias))
    return 'Sin datos'

  if (dias < 2)
    return 'Urgente'

  if (dias < 5)
    return 'Reponer'

  return 'Stock OK'
}
</script>

<style scoped>
.fondo {
  --background: #f4f6f9;
  color: #111;
}

/* RESUMEN */

.resumen {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.card-resumen {
  flex: 1;
  background: white;
  color: black;
  border-radius: 16px;
  padding: 14px;
  text-align: center;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-resumen h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 6px 0;
}

.card-resumen .titulo {
  font-size: 13px;
  color: #666;
}

.card-resumen .desc {
  font-size: 11px;
  color: #999;
}

.card-resumen.gris {
  border-top: 4px solid #757575;
}

.card-resumen.verde {
  border-top: 4px solid #4caf50;
}

.card-resumen.rojo {
  border-top: 4px solid #f44336;
}

/* CONTENEDOR DEL BUSCADOR Y BOTÓN */
.top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  position: relative;
}

/* INPUT DE BÚSQUEDA */
.top input {
  flex: 1;
  min-width: 0;
}

/* CONTENEDOR DEL DROPDOWN */
.dropdown-exportar {
  position: relative;
  flex-shrink: 0;
}

/* BOTÓN EXPORTAR */
.btn-exportar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: none;
  border-radius: 14px;
  background: #2e7d32;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: 0.2s;
}

.btn-exportar:hover {
  background: #256428;
  transform: translateY(-1px);
}

.btn-exportar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* MENÚ DESPLEGABLE */
.menu-exportar {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  z-index: 9999;
}

/* OPCIONES DEL MENÚ */
.menu-exportar button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  color: #222;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-exportar button:hover {
  background: #f5f5f5;
}

input {
  width: 100%;
  padding: 13px;
  border-radius: 14px;
  border: 1px solid #044e008f;
  background: rgb(247, 255, 241);
  color: black;
  font-size: 14px;
}

/* GRID */

.grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  padding: 12px;
}

/* CARD */

.card {
  background: white;
  border-radius: 18px;
  padding: 14px;
  color: black;
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.08);
  transition: 0.2s;
}

.card:hover {
  transform: translateY(-4px);
}

.card img {
  width: 75px;
  height: 75px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 10px;
}

.card h3 {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 700;
}

/* INFO */

.info p {
  margin: 4px 0;
  font-size: 13px;
}

/* BARRA */

.barra {
  height: 7px;
  background: #ececec;
  border-radius: 10px;
  margin: 10px 0;
}

.progreso {
  height: 100%;
  border-radius: 10px;
}

.progreso.verde {
  background: #4caf50;
}

.progreso.amarillo {
  background: #fbc02d;
}

.progreso.rojo {
  background: #f44336;
}

.progreso.gris {
  background: #9e9e9e;
}

/* BADGE */

.badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}

.badge.verde {
  background: #e8f5e9;
  color: #43a047;
}

.badge.amarillo {
  background: #fff8e1;
  color: #fbc02d;
}

.badge.rojo {
  background: #ffebee;
  color: #e53935;
}

.badge.gris {
  background: #eeeeee;
  color: #616161;
}

/* DETALLE */

.detalle {
  padding: 14px;
  color: black;
}

.grafica-container {
  background: white;
  padding: 10px;
  border-radius: 14px;
  margin-top: 10px;
}

.analisis {
  margin-top: 12px;
  background: white;
  padding: 14px;
  border-radius: 14px;
}

.analisis h3 {
  margin-bottom: 10px;
}

.analisis p {
  margin: 7px 0;
}

.insight {
  margin-top: 12px;
  padding: 14px;
  border-radius: 14px;
  font-weight: 600;
}

.insight.rojo {
  background: #ffebee;
  color: #e53935;
}

.insight.amarillo {
  background: #fff8e1;
  color: #fbc02d;
}

.insight.verde {
  background: #e8f5e9;
  color: #43a047;
}

.insight.gris {
  background: #eeeeee;
  color: #616161;
}

/* GENERALES */

.rojo {
  color: #e53935;
}

.amarillo {
  color: #fbc02d;
}

.verde {
  color: #43a047;
}

.gris {
  color: #757575;
}

.volver {
  margin-bottom: 12px;
  background: none;
  border: none;
  font-weight: 700;
  color: #444;
  font-size: 15px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .top {
    flex-direction: column;
    align-items: stretch;
  }

  .dropdown-exportar {
    width: 100%;
  }

  .btn-exportar {
    width: 100%;
    justify-content: center;
  }

  .menu-exportar {
    left: 0;
    right: 0;
    min-width: unset;
  }
}
</style>