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
            <span class="kpi-icono">📈</span>
            <span class="kpi-label">DEMANDA PROYECTADA</span>
            <span class="kpi-valor">{{ totalDemanda }} unid</span>
            <span class="kpi-sub">Para los próximos 7 días</span>
            <span class="kpi-badge positivo">+12.5%</span>
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
                <div class="barra proteinas" :style="{ height: dia.proteinas * 1.2 + 'px' }" />
                <div class="barra panes"     :style="{ height: dia.panes * 1.2 + 'px' }" />
                <div class="barra bebidas"   :style="{ height: dia.bebidas * 1.2 + 'px' }" />
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

        <!-- TABLA DE PREDICCIÓN -->
        <div class="seccion-tabla">
          <div class="seccion-titulo">
            <span>📋</span>
            <strong>Listado de Predicción por Producto</strong>
          </div>
          <p class="seccion-sub">Comparativa de stock actual frente a demanda estimada.</p>

          <div class="estado-carga" v-if="cargando">
            <ion-spinner name="crescent" color="dark" />
            <p>Calculando predicciones...</p>
          </div>

          <div v-else>
            <div class="tabla-fila cabecera">
              <span class="col-producto">Producto</span>
              <span class="col-num">Stock</span>
              <span class="col-num">Demanda</span>
              <span class="col-num">Conf.</span>
              <span class="col-accion">Reabast.</span>
            </div>

            <div
              class="tabla-fila"
              v-for="prod in productosConPrediccion"
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

            <div class="estado-vacio" v-if="productosConPrediccion.length === 0">
              <p>No hay datos de inventario disponibles.</p>
            </div>
          </div>

          <!-- Cobertura en días -->
          <div class="cobertura-lista" v-if="productosConPrediccion.length > 0">
            <p class="cobertura-titulo">Días de cobertura estimados</p>
            <div class="cobertura-fila" v-for="prod in productosConPrediccion" :key="'cob-' + prod.id">
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
  } catch {
    productos.value = [
      { id: 1, nombre: 'Carne de Res 150g', cantidad: 45, minimo: 20, categoria_nombre: 'Proteínas' },
      { id: 2, nombre: 'Pan Brioche', cantidad: 30, minimo: 25, categoria_nombre: 'Panes' },
      { id: 3, nombre: 'Sprite 450ml', cantidad: 8, minimo: 15, categoria_nombre: 'Bebidas' },
      { id: 4, nombre: 'Pechuga de Pollo', cantidad: 25, minimo: 10, categoria_nombre: 'Proteínas' },
      { id: 5, nombre: 'Queso Cheddar', cantidad: 200, minimo: 30, categoria_nombre: 'Proteínas' },
      { id: 6, nombre: 'Lechuga Batavia', cantidad: 5, minimo: 8, categoria_nombre: 'Vegetales' },
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
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
.kpis { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }

.kpi-card {
  background: white;
  border: 2px solid black;
  border-radius: 14px;
  padding: 14px 12px;
  flex: 1;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
}
.kpi-card.alerta { border-color: #ff7a00; }
.kpi-icono { font-size: 20px; }
.kpi-label { font-size: 9px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #888; }
.kpi-valor { font-size: 22px; font-weight: 900; color: black; line-height: 1.1; }
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
.cobertura-lista { margin-top: 16px; border-top: 2px solid #f0f0f0; padding-top: 14px; display: flex; flex-direction: column; gap: 10px; }
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
</style>