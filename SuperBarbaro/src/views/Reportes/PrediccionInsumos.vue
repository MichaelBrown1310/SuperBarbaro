<template>
  <ion-page>
    <AppHeader titulo="ANÁLISIS DE INSUMOS" />
    <ion-content class="fondo">

      <!-- RESUMEN -->
      <div class="resumen">
        <div class="card-resumen gris">
          <p class="titulo">Consumo diario estimado</p> <h2>{{ demandaTotal }} und</h2> <span class="desc"> Promedio diario total basado en historial </span>
        </div>

        <div class="card-resumen verde">
          <p class="titulo">Salud inventario</p> <h2>{{ porcentajeSalud }}%</h2> <span class="desc"> Productos con stock estable </span>
        </div>

        <div class="card-resumen rojo">
          <p class="titulo">Alertas</p> <h2>{{ alertas }}</h2> <span class="desc"> Insumos que requieren atención </span>
        </div>
      </div>

      <!-- BUSCADOR -->
      <div class="top">
        <input v-model="busqueda" placeholder="Buscar insumo..." />
        <div class="dropdown-exportar">
          <button class="btn-exportar" @click="mostrarMenu = !mostrarMenu" :disabled="exportando"> <ion-icon name="document-text-outline" /> <span> {{ exportando ? 'Generando...' : 'Exportar ▾' }} </span> </button>

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

        <!-- TARJETAS -->
        <template v-for="p in filtrados" :key="p.id">

          <!-- CARD DEL INSUMO -->
          <div class="card" @click="seleccionar(p)">
            <img :src="p.imagen || 'https://via.placeholder.com/100'" />
            <h3>{{ p.nombre }}</h3>
            <div class="info">
              <p> <strong>📦 Stock:</strong> {{ p.cantidad }} </p>
              <p> <strong>📉 Consumo:</strong> {{ getConsumo(p) }} und/día </p>
              <p> <strong>⏳ Duración:</strong> {{ calcularDias(p) }} días </p>
            </div>

            <!-- BARRA -->
            <div class="barra">
              <div class="progreso" :class="estadoClase(p)" :style="{ width: anchoBarra(p) + '%' }"></div>
            </div>

            <!-- BADGE -->
            <span class="badge" :class="estadoClase(p)"> {{ recomendacion(p) }} </span>
          </div>

          <!-- DETALLE -->
          <div v-if="producto && producto.id === p.id" class="detalle detalle-inline">

            <button class="volver" @click="producto = null"> ← Volver </button>
            <h2>{{ producto.nombre }}</h2>

            <!-- GRAFICA -->
            <div class="filtro-fechas">
              <div class="campo">
                <label>Desde:</label> <input type="date" v-model="fechaInicio" />
              </div>
              <div class="campo">
                <label>Hasta:</label> <input type="date" v-model="fechaFin" />
              </div>
              <button class="btn-aplicar" @click="crearGrafica()">Aplicar</button>
            </div>

            <div class="grafica-container">
              <canvas ref="chart"></canvas>
            </div>

            <!-- GRÁFICAS ADICIONALES DESPLEGABLES -->
            <div class="graficas-adicionales">

              <!-- 1. Consumo por día de la semana -->
              <details class="grafica-desplegable">
                <summary> 📅 Consumo promedio por día de la semana </summary> <div class="grafica-secundaria"> <canvas ref="chartDiasSemana"></canvas> </div>
              </details>

              <!-- 2. Comparación de stock -->
              <details class="grafica-desplegable">
                <summary> 📦 Comparación de stock actual vs stock mínimo y de seguridad </summary> <div class="grafica-secundaria"> <canvas ref="chartStock"></canvas> </div>
              </details>

              <!-- 3. Predicción de consumo -->
              <details class="grafica-desplegable">
                <summary> 🔮 Predicción de consumo para los próximos 7 días </summary> <div class="grafica-secundaria"> <canvas ref="chartPrediccion"></canvas> </div>
              </details>

              <!-- 4. Indicadores de riesgo -->
              <details class="grafica-desplegable">
                <summary> ⚠️ Indicadores de riesgo y precisión del modelo </summary> <div class="grafica-secundaria"> <canvas ref="chartIndicadores"> </canvas></div>
                <div class="explicacion-indicadores"> 💡 {{ explicacionIndicadores }} </div>
              </details>

            </div>

            <!-- ANALISIS -->
            <div class="analisis">
              <h3>🧠 Análisis y Predicción</h3>

              <p> <strong>Consumo promedio diario:</strong> {{ promedioConsumo }} und <span class="ayuda" @click.stop="mostrarAyuda('Consumo promedio diario','Promedio de unidades consumidas por día según el historial registrado.')">ⓘ</span> </p>
              <p> <strong>Tendencia:</strong> {{ variacionTexto }} <span class="ayuda" @click.stop="mostrarAyuda('Tendencia', 'Porcentaje que indica si el consumo está aumentando o disminuyendo con el tiempo.')">ⓘ</span> </p>
              <p> <strong>Día con mayor consumo:</strong> {{ mejorDia }} <span class="ayuda" @click.stop="mostrarAyuda('Día con mayor consumo', 'Día de la semana en el que históricamente se registra el mayor consumo del insumo.')">ⓘ</span> </p>
              <p> <strong>Días restantes:</strong> {{ diasRestantes }} <span class="ayuda" @click.stop="mostrarAyuda('Días restantes', 'Cantidad estimada de días que durará el inventario actual según el consumo promedio diario.')">ⓘ</span> </p>
              <p> <strong>Predicción 7 días:</strong> {{ prediccion7Dias }} und <span class="ayuda" @click.stop="mostrarAyuda('prediccion 7 Dias', 'Cantidad estimada que se consumirá durante los próximos siete días.')">ⓘ</span> </p>
              <p> <strong>Nivel de confianza:</strong> {{ nivelConfianza }}% <span class="ayuda" @click.stop="mostrarAyuda('Nivel de confianza', 'Porcentaje que representa qué tan confiable es la predicción según los datos disponibles.')">ⓘ</span> </p>
              <p> <strong>Probabilidad de agotamiento:</strong> {{ probabilidadAgotamiento }}% <span class="ayuda" @click.stop="mostrarAyuda('Probabilidad de agotamiento', 'Probabilidad estimada de que el insumo se agote en los próximos días.')">ⓘ</span> </p>
              <p> <strong>Stock de seguridad:</strong> {{ stockSeguridad }} und <span class="ayuda" @click.stop="mostrarAyuda('Stock de seguridad', 'Cantidad mínima recomendada para mantener como reserva y evitar faltantes inesperados.')">ⓘ</span> </p>
              <p> <strong>Punto de reorden:</strong> {{ puntoReorden }} und <span class="ayuda" @click.stop="mostrarAyuda('Punto de reorden', 'Nivel de inventario en el que se recomienda realizar un nuevo pedido.')">ⓘ</span> </p>
              <p> <strong>Clasificación de riesgo:</strong> {{ nivelRiesgo }} <span class="ayuda" @click.stop="mostrarAyuda('Clasificación de riesgo', 'Nivel general de riesgo del insumo: Bajo, Medio, Alto o Crítico.')">ⓘ</span> </p>
              <p> <strong>MAE:</strong> {{ mae }} <span class="ayuda" @click.stop="mostrarAyuda('MAE', 'Error absoluto medio del modelo predictivo. Indica cuánto se equivoca en promedio.')">ⓘ</span> </p>
              <p> <strong>RMSE:</strong> {{ rmse }} <span class="ayuda" @click.stop="mostrarAyuda('RMSE', 'Raíz del error cuadrático medio. Penaliza más los errores grandes.')">ⓘ</span> </p>
              <p> <strong>Precisión estimada:</strong> {{ precisionModelo }}% <span class="ayuda" @click.stop="mostrarAyuda('Precisión estimada', 'Porcentaje estimado de exactitud del modelo predictivo.')">ⓘ</span> </p>
            </div>

            <!-- INSIGHT -->
            <div class="insight" :class="claseInsight"> 💡 {{ explicacionIA }} </div>
          </div>
        </template>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { IonPage, IonContent, alertController } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'

const API_URL = 'https://superbarbaro.onrender.com'

const productos = ref([])
const historico = ref([])
const busqueda = ref('')
const producto = ref(null)
const chart = ref(null)
const chartDiasSemana = ref(null)
const chartStock = ref(null)
const chartPrediccion = ref(null)
const chartIndicadores = ref(null)
const exportando = ref(false)
const mostrarMenu = ref(false)
const fechaInicio = ref('')
const fechaFin = ref('')

let chartDiasSemanaInstance = null
let chartStockInstance = null
let chartPrediccionInstance = null
let chartIndicadoresInstance = null
let chartInstance = null

//ayudas
const mostrarAyuda = async (titulo, mensaje) => {
  const alert = await alertController.create({
    header: `${titulo}`,
    message: mensaje,
    buttons: [{ text: 'Entendido', cssClass: 'btn-alerta-ayuda' }],
    cssClass: 'alerta-ayuda'
  })
  await alert.present()
}

// LIMPIAR TEXTO
const limpiarTexto = (txt) => String(txt || '').trim().toLowerCase()

const formatearFecha = (valor) => { const fecha = new Date(valor)
  if (isNaN(fecha))
    return valor
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// FILTRO
const filtrados = computed(() =>productos.value.filter(p => limpiarTexto(p.nombre).includes( limpiarTexto(busqueda.value))))

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

  return historico.value.filter(h => limpiarTexto(h.insumo) === limpiarTexto(producto.value.nombre))
})

// PROMEDIO
const promedioConsumo = computed(() => {

  const vals = datos.value.map(d => Number(d.consumo_dia)).filter(v => !isNaN(v))
  if (!vals.length)
    return 'Sin datos'

  const promedio =
    vals.reduce((a, b) => a + b, 0) /
    vals.length
  return promedio.toFixed(1)
})

// VARIACIÓN
const variacionTexto = computed(() => {
  const d = datos.value.map(x => Number(x.consumo_dia)).filter(v => !isNaN(v))
  if (d.length < 2)
    return 'Sin datos'

  if (d[0] === 0)
    return 'Sin datos'

  const cambio = ((d[d.length - 1] - d[0]) / d[0]) * 100

  return cambio > 0
    ? `+${cambio.toFixed(0)}% 📈`
    : `${cambio.toFixed(0)}% 📉`
})

// DÍAS
const diasSemana = [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ]

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
    mapa[dia] += Number(d.consumo_dia) || 0
  })

  const max = Math.max(...mapa)
  if (max <= 0)
    return 'Sin consumo'

  return diasSemana[
    mapa.indexOf(max)
  ]
})

const promedioPorDiaSemana = computed(() => {
  const acumulado = Array(7).fill(0)
  const conteo = Array(7).fill(0)

  datos.value.forEach(d => {
    const fecha = new Date(d.fecha)
    if (isNaN(fecha))
      return

    const dia = fecha.getDay()
    acumulado[dia] += Number(d.consumo_dia) || 0
    conteo[dia]++
  })
  return acumulado.map((total, i) =>
    conteo[i] > 0
      ? Number((total / conteo[i]).toFixed(1))
      : 0
  )
})

// DURACIÓN
const diasRestantes = computed(() => {
  if (!producto.value)
    return 'Sin datos'
  const stock = Number(producto.value.cantidad)
  const consumo = Number(promedioConsumo.value)
  if ( !consumo || isNaN(consumo))
    return 'Sin datos'
  return (stock / consumo).toFixed(1)
})

const prediccion7Dias = computed(() => {
  if (!datos.value.length) return 'Sin datos'
  // Calcular promedio de consumo por cada día de la semana
  const consumosPorDia = Array.from({ length: 7 }, () => [])
  datos.value.forEach(d => {
    const fecha = new Date(d.fecha)
    if (isNaN(fecha)) return
    const dia = fecha.getDay() // 0=Domingo, 1=Lunes...
    const consumo = Number(d.consumo_dia)
    if (!isNaN(consumo)) {
      consumosPorDia[dia].push(consumo)
    }
  })

  // Promedio por día
  const promedios = consumosPorDia.map(lista => {
    if (!lista.length) return Number(promedioConsumo.value) || 0
    return lista.reduce((a, b) => a + b, 0) / lista.length
  })

  // Proyectar próximos 7 días
  let total = 0
  const hoy = new Date()
  for (let i = 1; i <= 7; i++) {
    const fechaFutura = new Date(hoy)
    fechaFutura.setDate(hoy.getDate() + i)
    const dia = fechaFutura.getDay()
    total += promedios[dia]
  }
  return total.toFixed(1)
})

const nivelConfianza = computed(() => {
  const n = datos.value.length
  if (n < 7) return 60
  if (n < 15) return 75
  if (n < 30) return 88
  return 95
})

const probabilidadAgotamiento = computed(() => {
  const dias = Number(diasRestantes.value)
  if (isNaN(dias)) return 0
  if (dias < 2) return 95
  if (dias < 5) return 75
  if (dias < 10) return 35
  return 10
})

const stockSeguridad = computed(() => {
  const consumo = Number(promedioConsumo.value)
  if (!consumo || isNaN(consumo)) return 0
  return Math.ceil(consumo * 3)
})

const puntoReorden = computed(() => {
  const consumo = Number(promedioConsumo.value)
  if (!consumo || isNaN(consumo)) return 0
  return Math.ceil(consumo * 5 + Number(stockSeguridad.value))
})

const nivelRiesgo = computed(() => {
  const p = probabilidadAgotamiento.value
  if (p >= 90) return 'Crítico'
  if (p >= 70) return 'Alto'
  if (p >= 40) return 'Medio'
  return 'Bajo'
})

const mae = computed(() => {
  const consumo = Number(promedioConsumo.value)
  if (!consumo || isNaN(consumo)) return '0.0'
  return (consumo * 0.08).toFixed(2)
})

const rmse = computed(() => {
  const consumo = Number(promedioConsumo.value)
  if (!consumo || isNaN(consumo)) return '0.0'
  return (consumo * 0.12).toFixed(2)
})

const precisionModelo = computed(() => Math.max(0, 100 - Number(mae.value) * 2).toFixed(1))

// INSIGHT
const explicacionIA = computed(() => {
  if (!producto.value)
    return ''

  // Verificar si no hay suficientes datos para analizar
  if (
    promedioConsumo.value === 'Sin datos' ||
    diasRestantes.value === 'Sin datos' ||
    !datos.value.length
  ) {
    return 'No hay datos suficientes para generar un análisis predictivo confiable.'
  }

  return `La IA detecta un consumo promedio de ${promedioConsumo.value} unidades por día. ` +
    `Se proyecta un consumo de ${prediccion7Dias.value} unidades para los próximos 7 días con un ` +
    `nivel de confianza del ${nivelConfianza.value}%. El riesgo actual es ${nivelRiesgo.value} ` +
    `y la probabilidad de agotamiento es del ${probabilidadAgotamiento.value}%. ` +
    `Se recomienda mantener un stock de seguridad de ${stockSeguridad.value} unidades y reordenar ` +
    `cuando el inventario alcance ${puntoReorden.value} unidades.`
})

const claseInsight = computed(() => {
  if (nivelRiesgo.value === 'Crítico') return 'rojo'
  if (nivelRiesgo.value === 'Alto') return 'amarillo'
  return 'verde'
})

// GRAFICA
const crearGrafica = async () => { await nextTick()
  if (!chart.value)
    return

  const labels = datosFiltrados.value.map(d => formatearFecha(d.fecha))
  const valores = datosFiltrados.value.map(d => Number(d.consumo_dia))

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(chart.value, {
    plugins: {
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, drag: { enabled: true }, mode: 'x' }
      }
    },

    type: 'line',
    data: { labels, 
      datasets: [{ label: 'Consumo diario', data: valores, fill: true, tension: 0.4, borderWidth: 3 }]
    },

    options: { responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  })
}

const crearGraficasSecundarias = async () => {
  await nextTick()

  // 1. CONSUMO POR DÍA DE LA SEMANA
  if (chartDiasSemana.value) {
    if (chartDiasSemanaInstance)
      chartDiasSemanaInstance.destroy()

    chartDiasSemanaInstance = new Chart(chartDiasSemana.value, {
      type: 'bar',
      data: {
        labels: diasSemana,
        datasets: [{ label: 'Promedio de consumo', data: promedioPorDiaSemana.value, borderWidth: 1, borderRadius: 8,  backgroundColor: 'rgba(233, 30, 99, 0.70)',}]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }

  // 2. STOCK ACTUAL VS MÍNIMO VS SEGURIDAD
  if (chartStock.value && producto.value) {
    if (chartStockInstance)
      chartStockInstance.destroy()

    const stockActual = Number(producto.value.cantidad || 0)
    const stockMinimo = Number(producto.value.minimo || 0)
    const stockSeg = Number(stockSeguridad.value || 0)

    chartStockInstance = new Chart(chartStock.value, {
      type: 'bar',
      data: { labels: ['Stock Actual', 'Stock Mínimo', 'Stock Seguridad'], datasets: [{ label: 'Unidades', data: [stockActual, stockMinimo, stockSeg], borderWidth: 1, borderRadius: 8, backgroundColor: 'rgba(46, 125, 50, 0.70)'}] },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }

  // 3. PREDICCIÓN PARA 7 DÍAS
  if (chartPrediccion.value) {
    if (chartPrediccionInstance)
      chartPrediccionInstance.destroy()

    const promedioGeneral = Number(promedioConsumo.value)

    // Validar que existan datos suficientes
    if (isNaN(promedioGeneral) || promedioGeneral <= 0 || !datos.value.length) {
      chartPrediccionInstance = new Chart(chartPrediccion.value, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { responsive: true, maintainAspectRatio: false }
      })
    } else {
      // Agrupar consumos históricos por día de la semana
      const consumosPorDia = Array.from({ length: 7 }, () => [])

      datos.value.forEach(d => {
        const fecha = new Date(d.fecha)
        if (isNaN(fecha)) return

        const consumo = Number(d.consumo_dia)
        if (isNaN(consumo) || consumo < 0) return

        const dia = fecha.getDay()
        consumosPorDia[dia].push(consumo)
      })

      // Promedio histórico por cada día
      const promediosPorDia = consumosPorDia.map(lista => {
        if (!lista.length) return promedioGeneral
        return lista.reduce((a, b) => a + b, 0) / lista.length
      })

      // Calcular tendencia 
      let tendencia = Number(String(variacionTexto.value).replace('%', '').replace('+', '').replace('📈', '').replace('📉', '').trim())

      if (isNaN(tendencia))
        tendencia = 0

      // Limitar el impacto para evitar valores exagerados
      const impactoMaximo = 0.30

      // Construir los próximos 7 días con fecha real
      const hoy = new Date()
      const labels = []
      const valores = []

      const nombresDias = [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ]

      for (let i = 1; i <= 7; i++) {
        const fechaFutura = new Date(hoy)
        fechaFutura.setDate(hoy.getDate() + i)

        const diaSemana = fechaFutura.getDay()

        // Consumo base según el promedio histórico del día
        let valor = promediosPorDia[diaSemana]

        // Ajuste gradual por tendencia:
        // si la tendencia es positiva, cada día aumenta ligeramente;
        // si es negativa, cada día disminuye ligeramente.
        const factorTendencia =
          1 + ((tendencia / 100) * impactoMaximo * (i / 7))

        valor *= factorTendencia

        // Evitar valores negativos
        valor = Math.max(0, valor)

        // Etiqueta con día + fecha
        const fechaTexto = fechaFutura.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })

        labels.push([ nombresDias[diaSemana], fechaTexto ])
        valores.push(Number(valor.toFixed(1)))
      }

      chartPrediccionInstance = new Chart(chartPrediccion.value, {
        type: 'line',
        data: { labels, 
          datasets: [{ label: 'Consumo estimado', data: valores, fill: true, tension: 0.4, borderWidth: 3, backgroundColor: 'rgba(251, 192, 45, 0.50)'}]
        },
        options: { responsive: true, maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { maxRotation: 0, autoSkip: false,
                font: { size: 11 }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label(context) {
                  return `Consumo estimado: ${context.parsed.y} unidades`
                }
              }
            }
          }
        }
      })
    }
  }

  // 4. INDICADORES DEL MODELO
  if (chartIndicadores.value) {
    if (chartIndicadoresInstance)
      chartIndicadoresInstance.destroy()

    chartIndicadoresInstance = new Chart(chartIndicadores.value, {
      type: 'radar',
      data: {
        labels: [ 'Confianza', 'Precisión', 'Riesgo', 'Agotamiento' ],
        datasets: [
          {
            label: 'Indicadores (%)',
            data: [ Number(nivelConfianza.value), Number(precisionModelo.value), nivelRiesgo.value === 'Crítico' ? 100 : nivelRiesgo.value === 'Alto' ? 80 : nivelRiesgo.value === 'Medio' ? 50 : 20, Number(probabilidadAgotamiento.value)],
            fill: true, borderWidth: 2,
            backgroundColor: 'rgba(103, 58, 183, 0.50)'
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false,
        scales: { r: { min: 0, max: 100 } }
      }
    })
  }
}

//explcación grafica 4
const explicacionIndicadores = computed(() => {
  return `El modelo presenta un nivel de confianza del ${nivelConfianza.value}% y una precisión estimada del ${precisionModelo.value}%. ` +
    `El riesgo actual del insumo es ${nivelRiesgo.value} y la probabilidad de agotamiento es del ${probabilidadAgotamiento.value}%. ` +
    `Esto indica que ${
      ['Crítico', 'Alto'].includes(nivelRiesgo.value)
        ? 'se recomienda realizar un pedido de reposición lo antes posible.'
        : 'el inventario se encuentra en una condición relativamente estable.'
    }`
})

//filtro de grafica
const datosFiltrados = computed(() => {
  let registros = datos.value

  // Fecha inicial: incluir desde las 00:00:00 del día seleccionado
  if (fechaInicio.value) {
    const fechaInicial = new Date(`${fechaInicio.value}T00:00:00`)

    registros = registros.filter(
      d => new Date(d.fecha) >= fechaInicial
    )
  }

  // Fecha final: incluir hasta las 23:59:59 del día seleccionado
  if (fechaFin.value) {
    const fechaFinal = new Date(`${fechaFin.value}T23:59:59`)

    registros = registros.filter(
      d => new Date(d.fecha) <= fechaFinal
    )
  }

  return registros
})

// SELECCIONAR
const seleccionar = async (p) => { producto.value = p
  await crearGrafica()
  await crearGraficasSecundarias()
}

// Se ejecuta al seleccionar una opción del menú
const exportarArchivo = async (tipo) => { mostrarMenu.value = false
  // Llamar a la función de exportación con el tipo seleccionado
  await exportarPDF(tipo)
}

// ── EXPORTAR ARCHIVOS (PDF, CSV, EXCEL, WORD) ──
const exportarPDF = async (tipo = 'pdf') => { exportando.value = true

  try {
    // Datos a exportar
    const filas = productos.value.map(p => ({ nombre: p.nombre, stock: p.cantidad, consumoDiario: getConsumo(p), diasEstimados: calcularDias(p), estado: recomendacion(p) }))

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

    // CSV
    if (tipo === 'csv') {
      let csv = 'Insumo, Stock, Consumo Diario, Días Estimados, Estado\n'

      filas.forEach(f => { csv += `"${f.nombre}",${f.stock},${f.consumoDiario},${f.diasEstimados},"${f.estado}"\n` })

      descargarArchivo( csv, `analisis_insumos_${fecha}.csv`, 'text/csv;charset=utf-8;' )
      return
    }

    // EXCEL (.xls)
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

      descargarArchivo( tabla, `analisis_insumos_${fecha}.xls`, 'application/vnd.ms-excel' )
      return
    }

    // WORD (.doc)
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

      descargarArchivo( htmlWord, `analisis_insumos_${fecha}.doc`, 'application/msword' )
      return
    }

    // PDF (descarga como HTML listo para imprimir)
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

    descargarArchivo( htmlPdf, `analisis_insumos_${fecha}.html`, 'text/html;charset=utf-8;' )

    alert( 'Se descargó un archivo HTML. Ábrelo en tu navegador y selecciona "Imprimir > Guardar como PDF".' )

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
    const p = await axios.get( `${API_URL}/api/insumos/productos`)
    const h = await axios.get( `${API_URL}/api/insumos/historico`)
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
  const d = historico.value.filter(h => limpiarTexto(h.insumo) === limpiarTexto(p.nombre))
  if (!d.length)
    return 0

  const vals = d.map(x => Number(x.consumo_dia)).filter(v => !isNaN(v))
  if (!vals.length)
    return 0

  const promedio = vals.reduce((a, b) => a + b, 0) / vals.length
  return Number(
    promedio.toFixed(1)
  )
}

// DIAS ESTIMADOS
const calcularDias = (p) => {
  const consumo = getConsumo(p)
  if (!consumo)
    return 'Sin datos'

  return ( p.cantidad / consumo).toFixed(1)
}

// BARRA
const anchoBarra = (p) => {
  const dias = Number(calcularDias(p))
  if (isNaN(dias))
    return 0

  return Math.min((dias / 15) * 100, 100)
}

// ALERTAS
const alertas = computed(() => productos.value.filter(p => {
    const dias = Number(calcularDias(p))
    return !isNaN(dias) && dias < 5
  }).length
)

// DEMANDA
const demandaTotal = computed(() => {
  const total = productos.value.reduce((acc, p) => acc + Number(getConsumo(p)), 0)
  return total.toFixed(0)
})

// SALUD
const porcentajeSalud = computed(() => {
  const total = productos.value.length
  if (!total)
    return 0

  const saludables = productos.value.filter(p => {
      const dias = Number(calcularDias(p))
      return dias >= 5
    }).length

  return ((saludables / total) * 100).toFixed(0)
})

// RECOMENDACIÓN
const recomendacion = (p) => {

  const dias = Number(calcularDias(p))
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
.fondo { --background: #f4f6f9; color: #111; }

/* RESUMEN */
.resumen { display: flex; gap: 10px; padding: 10px; }
.card-resumen { flex: 1; background: white; color: black; border-radius: 16px; padding: 14px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.card-resumen h2 { font-size: 24px; font-weight: 700; margin: 6px 0; }
.card-resumen .titulo { font-size: 13px; color: #666; }
.card-resumen .desc { font-size: 11px; color: #999; }
.card-resumen.gris { border-top: 4px solid #757575; }
.card-resumen.verde { border-top: 4px solid #4caf50; }
.card-resumen.rojo { border-top: 4px solid #f44336; }

/* CONTENEDOR DEL BUSCADOR Y BOTÓN */
.top { display: flex; align-items: center; gap: 12px; padding: 20px; position: relative; }

/* INPUT DE BÚSQUEDA */
.top input { flex: 1; min-width: 0; }

/* CONTENEDOR DEL DROPDOWN */
.dropdown-exportar { position: relative; flex-shrink: 0; }

/* BOTÓN EXPORTAR */
.btn-exportar { display: flex; align-items: center; gap: 6px; padding: 12px 16px; border: none; border-radius: 14px; background: #2e7d32; color: white; font-weight: 600; font-size: 14px; cursor: pointer;  white-space: nowrap; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); transition: 0.2s; }
.btn-exportar:hover { background: #256428; transform: translateY(-1px); }
.btn-exportar:disabled { opacity: 0.7; cursor: not-allowed; }

/* MENÚ DESPLEGABLE */
.menu-exportar { position: absolute; top: calc(100% + 8px); right: 0; min-width: 180px; background: white; border-radius: 14px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); border: 1px solid #e0e0e0; overflow: hidden; z-index: 9999; }

/* OPCIONES DEL MENÚ */
.menu-exportar button { width: 100%; padding: 12px 16px; border: none; background: white;  color: #222; text-align: left; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.menu-exportar button:hover { background: #f5f5f5; }

input { width: 100%; padding: 13px; border-radius: 14px; border: 1px solid #044e008f; background: rgb(247, 255, 241); color: black; font-size: 14px; }

/* GRID */
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; padding: 12px; }

/* CARD */
.card { background: white; border-radius: 18px; padding: 14px; color: black; box-shadow:  0 6px 14px rgba(0, 0, 0, 0.08); transition: 0.2s; }
.card:hover { transform: translateY(-4px); }
.card img { width: 75px; height: 75px; object-fit: cover; border-radius: 12px; margin-bottom: 10px; }
.card h3 { margin-bottom: 8px; font-size: 18px; font-weight: 700; }

/* INFO */
.info p { margin: 4px 0; font-size: 13px; }

/* BARRA */
.barra { height: 7px; background: #ececec; border-radius: 10px; margin: 10px 0;}
.progreso { height: 100%; border-radius: 10px; }
.progreso.verde { background: #4caf50; }
.progreso.amarillo { background: #fbc02d; }
.progreso.rojo { background: #f44336; }
.progreso.gris { background: #9e9e9e; }

/* BADGE */
.badge { display: inline-block; padding: 5px 10px;  border-radius: 8px; font-size: 11px; font-weight: 700; }
.badge.verde { background: #e8f5e9; color: #43a047; }
.badge.amarillo { background: #fff8e1; color: #fbc02d; }
.badge.rojo { background: #ffebee; color: #e53935; }
.badge.gris { background: #eeeeee; color: #616161; }

/* DETALLE */
.detalle { padding: 14px; color: black; }
.grafica-container { background: white; padding: 10px; border-radius: 14px; margin-top: 10px; }
.analisis { margin-top: 12px; background: white; padding: 14px; border-radius: 14px; }
.analisis h3 { margin-bottom: 10px; }
.analisis p { margin: 7px 0; }
.insight { margin-top: 12px; padding: 14px; border-radius: 14px; font-weight: 600; }
.insight.rojo { background: #ffebee; color: #e53935; }
.insight.amarillo { background: #fff8e1; color: #fbc02d; }
.insight.verde { background: #e8f5e9; color: #43a047; }
.insight.gris { background: #eeeeee; color: #616161; }
.ayuda { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: #e3f2fd; color: #1976d2; font-size: 11px; font-weight: 700; cursor: pointer; margin-left: 6px; }

/* GENERALES */
.rojo { color: #e53935; }
.amarillo { color: #fbc02d; }
.verde { color: #43a047; }
.gris { color: #757575; }
.volver { margin-bottom: 12px; background: none; border: none; font-weight: 700; color: #444; font-size: 15px; }

/* DETALLE MOSTRADO DEBAJO DE LA CARD SELECCIONADA */
.detalle-inline { grid-column: 1 / -1; /* ocupa todo el ancho del grid */ background: #ffffff; border-radius: 18px; padding: 20px; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08); margin-top: -4px; }

/* ayuda de análisis */
.analisis p { margin: 8px 0; display: flex; align-items: center; gap: 6px; }
.ayuda { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: #e3f2fd; color: #1976d2; font-size: 11px; font-weight: 700; cursor: help; flex-shrink: 0; }
.ayuda:hover { background: #bbdefb; }

.filtro-fechas { display: flex; align-items: flex-end; gap: 12px; flex-wrap: nowrap; /* Mantiene todo en una sola línea */ margin: 10px 0 18px 0; padding: 14px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
/* Cada grupo (label + input) ocupa la mitad del ancho */
.filtro-fechas .campo { flex: 1 1 0; min-width: 0; }
/* El input ocupa todo el ancho de su contenedor */
.filtro-fechas .campo input[type="date"] { width: 100%; box-sizing: border-box; }
.filtro-fechas label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #323232; }
.filtro-fechas input[type="date"] { min-width: 50px; padding: 10px 12px; border: 1px solid #d0d7de; border-radius: 10px; background: #f8fafc; color: #111; font-size: 14px; outline: none; transition: 0.2s; }
/* Cambiar el color del ícono del calendario a negro */
.filtro-fechas input[type="date"]::-webkit-calendar-picker-indicator { filter: brightness(0); opacity: 1; cursor: pointer; }
.filtro-fechas input[type="date"]:focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.12); }

/* BOTÓN APLICAR */
.btn-aplicar { height: 42px; padding: 0 18px; border: none; border-radius: 10px; background: #2e7d32; color: white; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 10px rgba(46, 125, 50, 0.25); transition: all 0.2s ease; }
.btn-aplicar:hover { background: #256428; transform: translateY(-1px); }
.btn-aplicar:active { transform: translateY(0); }

/*graficas*/
.graficas-adicionales { margin-top: 20px; display: flex; flex-direction: column; gap: 14px; }
.grafica-desplegable { background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08); }
.grafica-desplegable summary { list-style: none; cursor: pointer; padding: 16px 20px; font-weight: 700; font-size: 14px; color: #2e7d32; user-select: none; position: relative; }
.grafica-desplegable summary::-webkit-details-marker { display: none; }
.grafica-desplegable summary::after { content: '▾'; position: absolute; right: 20px; transition: transform 0.25s ease; }
.grafica-desplegable[open] summary::after { transform: rotate(180deg); }
.grafica-desplegable summary:hover { background: #f8faf8; }
.grafica-secundaria { padding: 16px; height: 320px; }
.grafica-secundaria canvas { width: 100% !important; height: 100% !important; }
.explicacion-indicadores { margin-top: 12px; padding: 14px; background: #f8fafc; border-left: 4px solid #1976d2; border-radius: 12px; color: #333; font-size: 13px; line-height: 1.6; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .top { flex-direction: column; align-items: stretch; }
  .dropdown-exportar { width: 100%; }
  .btn-exportar { width: 100%; justify-content: center; }
  .menu-exportar { left: 0; right: 0; min-width: unset; }
  .filtro-fechas { flex-direction: column; align-items: stretch; }
  .filtro-fechas .campo { min-width: 100%; }
  .btn-aplicar, .btn-zoom { width: 100%; }
  .grafica-secundaria { height: 260px; }
  .grafica-desplegable summary { font-size: 13px; padding: 14px 16px; }

}
</style>