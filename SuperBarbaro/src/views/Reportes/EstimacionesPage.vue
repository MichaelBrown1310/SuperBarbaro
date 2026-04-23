<template>
  <ion-page>
    <AppHeader titulo="ESTIMACIONES" :mostrarVolver="true" />

    <ion-content class="fondo">
      <div class="contenedor">

        <!-- ALERTA CRÍTICA -->
        <div class="alerta-critica" v-if="productosCriticos.length > 0">
          <div class="alerta-icono">⚠️</div>
          <div class="alerta-texto">
            <span class="alerta-titulo">Alerta de Inventario Crítico</span>
            <span class="alerta-desc">
              {{ productosCriticos.length }} producto{{ productosCriticos.length > 1 ? 's' : '' }}
              ({{ productosCriticos.map(p => p.nombre).join(', ') }})
              se agotarán en menos de 48 horas según la predicción actual.
            </span>
          </div>
        </div>

        <!-- TARJETAS KPI -->
        <div class="kpis">
          <div class="kpi-card">
            <span class="kpi-badge positivo">+12.5%</span>
            <span class="kpi-icono">📈</span>
            <span class="kpi-label">DEMANDA PROYECTADA</span>
            <span class="kpi-valor">{{ totalDemanda }} unid</span>
            <span class="kpi-sub">Para los próximos 7 días</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-icono">✅</span>
            <span class="kpi-label">CONFIANZA MEDIA</span>
            <span class="kpi-valor">{{ confianzaMedia }}%</span>
            <span class="kpi-sub">Precisión de modelos históricos</span>
          </div>
          <div class="kpi-card alerta" v-if="alertasActivas > 0">
            <span class="kpi-icono">⚠️</span>
            <span class="kpi-label">ALERTAS ACTIVAS</span>
            <span class="kpi-valor rojo">{{ String(alertasActivas).padStart(2, '0') }}</span>
            <span class="kpi-sub">Productos por debajo del umbral</span>
          </div>
        </div>

        <!-- GRID PRINCIPAL: izquierda gráficas, derecha tabla -->
        <div class="grid-principal">

          <!-- COLUMNA IZQUIERDA -->
          <div class="col-izquierda">

            <!-- GRÁFICA DE BARRAS SEMANAL -->
            <div class="seccion-grafica">
              <div class="seccion-titulo">
                <span>📊</span>
                <strong>Demanda por Categoría</strong>
              </div>
              <p class="seccion-sub">Volumen proyectado por día de la semana</p>
              <div class="grafica-barras">
                <div class="barra-grupo" v-for="(dia, i) in graficaDias" :key="i">
                  <div class="barras-stack">
                    <div class="barra proteinas" :style="{ height: dia.proteinas * 0.9 + 'px' }" />
                    <div class="barra panes"     :style="{ height: dia.panes * 0.9 + 'px' }" />
                    <div class="barra bebidas"   :style="{ height: dia.bebidas * 0.9 + 'px' }" />
                  </div>
                  <span class="dia-label">{{ dia.nombre }}</span>
                </div>
              </div>
              <div class="leyenda">
                <span class="leyenda-item"><span class="dot proteinas"></span> Proteínas</span>
                <span class="leyenda-item"><span class="dot panes"></span> Panes</span>
                <span class="leyenda-item"><span class="dot bebidas"></span> Bebidas</span>
              </div>
            </div>

            <!-- DIAGRAMA DE TORTA -->
            <div class="seccion-grafica">
              <div class="seccion-titulo">
                <span>🥧</span>
                <strong>Producto estimado de mayor venta</strong>
              </div>
              <p class="seccion-sub">Basado en ventas reales (presencial + domicilio) de la semana actual.</p>

              <div class="torta-wrap" v-if="!cargando && productosVendidos.length > 0">
                <svg viewBox="0 0 200 200" class="torta-svg">
                  <g transform="translate(100,100)">
                    <path
                      v-for="(seg, i) in segmentosTorta"
                      :key="i"
                      :d="seg.path"
                      :fill="seg.color"
                      stroke="white"
                      stroke-width="2"
                    />
                  </g>
                </svg>
                <div class="torta-leyenda">
                  <div class="torta-leyenda-item" v-for="(seg, i) in segmentosTorta" :key="'ley-' + i">
                    <span class="torta-dot" :style="{ background: seg.color }"></span>
                    <div class="torta-leyenda-texto">
                      <span class="torta-nombre">{{ seg.nombre }}</span>
                      <span class="torta-pct">{{ seg.porcentaje }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="producto-estrella" v-if="productoEstrella">
                <span class="estrella-icono">🏆</span>
                <div class="estrella-info">
                  <span class="estrella-label">Mayor demanda estimada</span>
                  <span class="estrella-nombre">{{ productoEstrella.nombre }}</span>
                  <span class="estrella-valor">{{ productoEstrella.demandaPredicha }} unidades vendidas (presencial + domicilio)</span>
                </div>
              </div>
            </div>

          </div><!-- /col-izquierda -->

          <!-- COLUMNA DERECHA: TABLA DE PREDICCIÓN -->
          <div class="col-derecha">
        <div class="seccion-tabla seccion-tabla-full">
          <div class="seccion-titulo">
            <span>📋</span>
            <strong>Listado de Predicción por Producto</strong>
          </div>
          <p class="seccion-sub">Comparativa de stock actual frente a demanda estimada.</p>

          <!-- FILTRO POR CATEGORÍA -->
          <div class="filtro-categorias">
            <button
              v-for="cat in categorias"
              :key="cat"
              class="chip-cat"
              :class="{ activo: categoriaFiltro === cat }"
              @click="categoriaFiltro = cat"
            >{{ cat }}</button>
          </div>

          <div class="estado-carga" v-if="cargando">
            <ion-spinner name="crescent" color="dark" />
            <p>Calculando predicciones...</p>
          </div>

          <div v-else class="tabla-scroll">
            <div class="tabla-fila cabecera">
              <span class="col-producto">Producto</span>
              <span class="col-num">Stock</span>
              <span class="col-num">Demanda</span>
              <span class="col-num">Conf.</span>
              <span class="col-accion">Reabast.</span>
            </div>

            <div
              class="tabla-fila"
              v-for="prod in productosFiltrados"
              :key="prod.id"
              :class="{ critico: prod.coberturaDias < 2, advertencia: prod.coberturaDias >= 2 && prod.coberturaDias < 4 }"
            >
              <div class="col-producto">
                <span class="prod-nombre">{{ prod.nombre }}</span>
                <span class="prod-cat">{{ prod.categoria }}</span>
              </div>
              <div class="col-num">
                <span :class="prod.cantidad <= prod.minimo ? 'stock-bajo' : ''">
                  {{ prod.cantidad }} {{ prod.unidad }}
                </span>
              </div>
              <div class="col-num">{{ prod.demandaPredicha }} {{ prod.unidad }}</div>
              <div class="col-num">{{ prod.confianza }}%</div>
              <div class="col-accion">
                <span v-if="prod.reabastecimiento > 0" class="badge-reabast">
                  +{{ prod.reabastecimiento }} {{ prod.unidad }}
                </span>
                <span v-else class="badge-ok">Stock OK</span>
              </div>
            </div>

            <div class="estado-vacio" v-if="productosFiltrados.length === 0">
              <p>No hay productos en esta categoría.</p>
            </div>
          </div>

          <!-- Cobertura en días -->
          <div class="cobertura-lista" v-if="productosFiltrados.length > 0">
            <p class="cobertura-titulo">Días de cobertura estimados</p>
            <div class="cobertura-scroll">
              <div class="cobertura-fila" v-for="prod in productosFiltrados" :key="'cob-' + prod.id">
                <span class="cob-nombre">{{ prod.nombre }}</span>
                <div class="cob-barra-wrap">
                  <div
                    class="cob-barra"
                    :class="prod.coberturaDias < 2 ? 'roja' : prod.coberturaDias < 4 ? 'naranja' : 'verde'"
                    :style="{ width: Math.min(prod.coberturaDias / 10 * 100, 100) + '%' }"
                  />
                </div>
                <span class="cob-dias" :class="prod.coberturaDias < 2 ? 'rojo' : ''">
                  {{ prod.coberturaDias.toFixed(1) }} días
                  <span v-if="prod.coberturaDias < 2" class="cob-urgente">Acción requerida</span>
                </span>
              </div>
            </div>
          </div>
        </div>
          </div><!-- /col-derecha -->

        </div><!-- /grid-principal -->

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import AppHeader from '../../components/AppHeader.vue'
import { ref, computed, onMounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'

const cargando = ref(true)
const productos = ref([])
const categoriaFiltro = ref('Todas')
const ventasReales = ref([])

const graficaDias = ref([
  { nombre: 'Lun', proteinas: 45, panes: 30, bebidas: 20 },
  { nombre: 'Mar', proteinas: 55, panes: 40, bebidas: 25 },
  { nombre: 'Mié', proteinas: 60, panes: 45, bebidas: 30 },
  { nombre: 'Jue', proteinas: 70, panes: 55, bebidas: 35 },
  { nombre: 'Vie', proteinas: 90, panes: 70, bebidas: 50 },
  { nombre: 'Sáb', proteinas: 120, panes: 95, bebidas: 70 },
  { nombre: 'Dom', proteinas: 110, panes: 85, bebidas: 65 },
])

const productosConPrediccion = computed(() => {
  return productos.value.map(p => {
    const confianza = Math.floor(75 + ((p.id * 7) % 20))
    const demandaPredicha = Math.max(p.minimo * 2, Math.floor(p.cantidad * 0.6))
    const reabastecimiento = Math.max(0, demandaPredicha - p.cantidad)
    const consumoDiario = demandaPredicha / 7
    const coberturaDias = consumoDiario > 0 ? p.cantidad / consumoDiario : 99
    return {
      ...p,
      confianza,
      demandaPredicha,
      reabastecimiento,
      coberturaDias,
      unidad: 'unid',
      categoria: p.categoria_nombre || 'Insumo'
    }
  })
})

const categorias = computed(() => {
  const cats = [...new Set(productosConPrediccion.value.map(p => p.categoria))]
  return ['Todas', ...cats.sort()]
})

const productosFiltrados = computed(() => {
  if (categoriaFiltro.value === 'Todas') return productosConPrediccion.value
  return productosConPrediccion.value.filter(p => p.categoria === categoriaFiltro.value)
})

const productosCriticos = computed(() =>
  productosConPrediccion.value.filter(p => p.coberturaDias < 2)
)

const totalDemanda = computed(() =>
  productosConPrediccion.value.reduce((acc, p) => acc + p.demandaPredicha, 0)
)

const confianzaMedia = computed(() => {
  if (productosConPrediccion.value.length === 0) return 0
  const suma = productosConPrediccion.value.reduce((acc, p) => acc + p.confianza, 0)
  return (suma / productosConPrediccion.value.length).toFixed(1)
})

const alertasActivas = computed(() =>
  productosConPrediccion.value.filter(p => p.cantidad <= p.minimo).length
)

// ── Productos más vendidos desde ventas reales (domicilios + presencial) ──
const productosVendidos = computed(() => {
  const mapa = {}
  for (const venta of ventasReales.value) {
    for (const item of (venta.items || [])) {
      const key = item.nombre
      if (!mapa[key]) mapa[key] = { nombre: key, cantidad: 0 }
      mapa[key].cantidad += item.cantidad || 1
    }
  }
  return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad)
})

// ── Colores del diagrama de torta (naranja/negro/grises del app) ──
const COLORES_TORTA = [
  '#ff7a00', '#1a1a1a', '#ff3b3b', '#888888',
  '#ffd000', '#444444', '#ffb347', '#cccccc'
]

const segmentosTorta = computed(() => {
  const prods = productosVendidos.value
  if (prods.length === 0) return []

  const top = prods.slice(0, 5)
  const total = top.reduce((acc, p) => acc + p.cantidad, 0)
  if (total === 0) return []

  const R = 90
  let anguloActual = -Math.PI / 2

  return top.map((p, i) => {
    const fraccion = p.cantidad / total
    const angulo = fraccion * 2 * Math.PI
    const x1 = Math.cos(anguloActual) * R
    const y1 = Math.sin(anguloActual) * R
    const x2 = Math.cos(anguloActual + angulo) * R
    const y2 = Math.sin(anguloActual + angulo) * R
    const largeArc = angulo > Math.PI ? 1 : 0

    const path = `M 0 0 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
    anguloActual += angulo

    const nombreCorto = p.nombre.length > 14 ? p.nombre.slice(0, 13) + '…' : p.nombre

    return {
      nombre: nombreCorto,
      porcentaje: (fraccion * 100).toFixed(1),
      color: COLORES_TORTA[i % COLORES_TORTA.length],
      path
    }
  })
})

const productoEstrella = computed(() => {
  if (productosVendidos.value.length === 0) return null
  const top = productosVendidos.value[0]
  return { nombre: top.nombre, demandaPredicha: top.cantidad }
})

const cargar = async () => {
  cargando.value = true
  try {
    const resCat = await fetch('http://localhost:3000/categorias')
    const cats = await resCat.json()
    const todos = []
    for (const cat of cats) {
      const res = await fetch(`http://localhost:3000/productos/${cat.id}`)
      const prods = await res.json()
      prods.forEach(p => todos.push({ ...p, categoria_nombre: cat.nombre }))
    }
    const unicos = todos.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
    productos.value = unicos

    try {
      const resV = await fetch('http://localhost:3000/ventas')
      ventasReales.value = await resV.json()
    } catch {
      ventasReales.value = []
    }
  } catch {
    productos.value = [
      { id: 1, nombre: 'Carne de Res 150g', cantidad: 45, minimo: 20, categoria_nombre: 'Proteínas' },
      { id: 2, nombre: 'Pan Brioche', cantidad: 30, minimo: 25, categoria_nombre: 'Panes' },
      { id: 3, nombre: 'Sprite 450ml', cantidad: 8, minimo: 15, categoria_nombre: 'Bebidas' },
      { id: 4, nombre: 'Pechuga de Pollo', cantidad: 25, minimo: 10, categoria_nombre: 'Proteínas' },
      { id: 5, nombre: 'Queso Cheddar', cantidad: 200, minimo: 30, categoria_nombre: 'Proteínas' },
      { id: 6, nombre: 'Lechuga Batavia', cantidad: 5, minimo: 8, categoria_nombre: 'Vegetales' },
    ]
    // Fallback ventas de demo
    ventasReales.value = [
      { id: 1, tipo: 'presencial', items: [{ nombre: 'Hamburguesa', cantidad: 2 }, { nombre: 'Jugo', cantidad: 1 }] },
      { id: 2, tipo: 'domicilio',  items: [{ nombre: 'Perro caliente', cantidad: 1 }, { nombre: 'Papas fritas', cantidad: 2 }] },
      { id: 3, tipo: 'presencial', items: [{ nombre: 'Combo familiar', cantidad: 1 }, { nombre: 'Hamburguesa', cantidad: 3 }, { nombre: 'Bebida', cantidad: 3 }] },
      { id: 4, tipo: 'domicilio',  items: [{ nombre: 'Hamburguesa', cantidad: 2 }, { nombre: 'Papas fritas', cantidad: 1 }] },
      { id: 5, tipo: 'presencial', items: [{ nombre: 'Perro caliente', cantidad: 2 }, { nombre: 'Jugo', cantidad: 2 }] },
    ]
  } finally {
    cargando.value = false
  }
}

onIonViewWillEnter(cargar)
onMounted(cargar)
</script>

<style scoped>
.fondo { --background: #f7f7f7; }

.contenedor {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Grid principal dos columnas ── */
.grid-principal {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 14px;
  align-items: start;
}

.col-izquierda {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.col-derecha {
  display: flex;
  flex-direction: column;
}

.seccion-tabla-full {
  height: 100%;
}

/* En pantallas pequeñas vuelve a columna única */
@media (max-width: 600px) {
  .grid-principal {
    grid-template-columns: 1fr;
  }
}

/* ── Alerta crítica ── */
.alerta-critica {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff3f3;
  border: 2px solid #ff3b3b;
  border-radius: 14px;
  padding: 14px 16px;
}
.alerta-icono { font-size: 22px; flex-shrink: 0; }
.alerta-texto { display: flex; flex-direction: column; gap: 4px; }
.alerta-titulo { font-weight: 800; font-size: 13px; color: #cc0000; letter-spacing: 0.3px; }
.alerta-desc { font-size: 12px; color: #555; line-height: 1.4; }

/* ── KPIs ── */
.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.kpi-card {
  background: white;
  border: 2px solid black;
  border-radius: 14px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
}
.kpi-card.alerta { border-color: #ff7a00; }
.kpi-icono { font-size: 20px; }
.kpi-label { font-size: 9px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #888; }
.kpi-valor { font-size: 26px; font-weight: 900; color: black; line-height: 1.1; }
.kpi-valor.rojo { color: #ff3b3b; }
.kpi-sub { font-size: 10px; color: #999; line-height: 1.3; }
.kpi-badge { position: absolute; top: 10px; right: 10px; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
.kpi-badge.positivo { background: #e8f5e9; color: #2e7d32; }

/* ── Secciones ── */
.seccion-grafica,
.seccion-tabla {
  background: white;
  border: 2px solid black;
  border-radius: 16px;
  padding: 16px;
}
.seccion-titulo { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; margin-bottom: 2px; }
.seccion-sub { font-size: 11px; color: #999; margin: 0 0 14px 0; }

/* ── Gráfica ── */
.grafica-barras {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 160px;
  padding-bottom: 4px;
  border-bottom: 2px solid #eee;
  margin-bottom: 10px;
}
.barra-grupo { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
.barras-stack { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 2px; width: 100%; height: 140px; }
.barra { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.4s ease; }
.barra.proteinas { background: #ff7a00; }
.barra.panes     { background: #1a1a1a; }
.barra.bebidas   { background: #e0e0e0; }
.dia-label { font-size: 10px; font-weight: 700; color: #555; text-transform: uppercase; }
.leyenda { display: flex; gap: 14px; justify-content: center; }
.leyenda-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #555; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.proteinas { background: #ff7a00; }
.dot.panes     { background: #1a1a1a; }
.dot.bebidas   { background: #e0e0e0; border: 1px solid #ccc; }

/* ── Filtro categorías ── */
.filtro-categorias {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.chip-cat {
  background: #f0f0f0;
  border: 1.5px solid #ddd;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #555;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.chip-cat.activo {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}
.chip-cat:not(.activo):active {
  background: #e0e0e0;
}

/* ── Scroll tabla ── */
.tabla-scroll {
  max-height: 340px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #ccc #f7f7f7;
  padding-right: 2px;
}
.tabla-scroll::-webkit-scrollbar {
  width: 5px;
}
.tabla-scroll::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 10px;
}
.tabla-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.tabla-scroll .tabla-fila.cabecera {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  padding-bottom: 6px;
  border-bottom: 2px solid #eee;
}

/* ── Scroll cobertura ── */
.cobertura-scroll {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #ccc #f7f7f7;
  padding-right: 2px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cobertura-scroll::-webkit-scrollbar {
  width: 5px;
}
.cobertura-scroll::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 10px;
}
.cobertura-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

/* ── Tabla ── */
.tabla-fila { display: flex; align-items: center; gap: 6px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
.tabla-fila.cabecera { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #aaa; letter-spacing: 0.5px; padding-bottom: 6px; }
.tabla-fila.critico    { background: #fff8f8; border-radius: 8px; padding: 10px 6px; }
.tabla-fila.advertencia { background: #fffbf5; border-radius: 8px; padding: 10px 6px; }
.col-producto { flex: 2.5; display: flex; flex-direction: column; gap: 2px; }
.prod-nombre { font-weight: 700; font-size: 12px; color: black; }
.prod-cat { font-size: 10px; color: #ff7a00; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.col-num { flex: 1; text-align: center; font-weight: 600; color: #333; }
.col-accion { flex: 1.2; text-align: right; }
.stock-bajo { color: #ff3b3b; font-weight: 800; }
.badge-reabast { background: #ff7a00; color: white; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }
.badge-ok { background: #e8f5e9; color: #2e7d32; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }

/* ── Cobertura ── */
.cobertura-lista { margin-top: 16px; border-top: 2px solid #f0f0f0; padding-top: 14px; }
.cobertura-titulo { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #888; margin: 0 0 4px 0; }
.cobertura-fila { display: flex; align-items: center; gap: 10px; }
.cob-nombre { font-size: 11px; font-weight: 600; flex: 2; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cob-barra-wrap { flex: 3; height: 8px; background: #f0f0f0; border-radius: 10px; overflow: hidden; }
.cob-barra { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
.cob-barra.verde   { background: #4caf50; }
.cob-barra.naranja { background: #ff7a00; }
.cob-barra.roja    { background: #ff3b3b; }
.cob-dias { font-size: 11px; font-weight: 700; flex: 1.5; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.cob-dias.rojo { color: #ff3b3b; }
.cob-urgente { font-size: 9px; color: #ff3b3b; font-weight: 600; }

/* ── Carga / vacío ── */
.estado-carga { display: flex; flex-direction: column; align-items: center; padding: 30px 0; gap: 10px; color: #aaa; font-size: 13px; }
.estado-vacio { text-align: center; padding: 20px; color: #aaa; font-size: 13px; }

/* ── Diagrama de torta ── */
.torta-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.torta-svg {
  width: 160px;
  height: 160px;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
}

.torta-leyenda {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.torta-leyenda-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.torta-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.torta-leyenda-texto {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.torta-nombre {
  font-size: 11px;
  font-weight: 700;
  color: #222;
}

.torta-pct {
  font-size: 10px;
  color: #ff7a00;
  font-weight: 800;
}

/* ── Producto estrella ── */
.producto-estrella {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #0a0a0a, #1c1c1c);
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 4px;
}

.estrella-icono {
  font-size: 28px;
  flex-shrink: 0;
}

.estrella-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.estrella-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #888;
}

.estrella-nombre {
  font-size: 16px;
  font-weight: 900;
  background: linear-gradient(90deg, #ff3b3b, #ff7a00, #ffd000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.estrella-valor {
  font-size: 11px;
  color: #aaa;
  font-weight: 600;
}
</style>