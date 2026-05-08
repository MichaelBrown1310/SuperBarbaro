<template>
  <ion-page>
    <AppHeader titulo="REPORTES" :mostrarVolver="false" />

    <ion-content class="fondo-reportes">
      <div class="contenedor-reportes">

        <!-- RESUMEN EJECUTIVO -->
        <div class="resumen-ejecutivo">
          <p class="resumen-titulo">Resumen del día</p>
          <div class="resumen-fila">
            <div class="resumen-item">
              <span class="resumen-icono">💰</span>
              <span class="resumen-valor">{{ ventaHoy }}</span>
              <span class="resumen-label">Venta hoy</span>
            </div>
            <div class="resumen-divider" />
            <div class="resumen-item">
              <span class="resumen-icono">🏆</span>
              <span class="resumen-valor truncar">{{ productoTop }}</span>
              <span class="resumen-label">Más vendido</span>
            </div>
            <div class="resumen-divider" />
            <div class="resumen-item">
              <span class="resumen-icono">⚠️</span>
              <span class="resumen-valor" :class="insumosAlerta > 0 ? 'alerta-num' : ''">{{ insumosAlerta }}</span>
              <span class="resumen-label">Alertas stock</span>
            </div>
          </div>
        </div>

        <!-- BOTONES -->
        <div class="grid-botones">

          <button class="boton-reporte" @click="irVentasDiarias">
            <div class="boton-icono-wrap naranja">
              <ion-icon name="bar-chart-outline" />
            </div>
            <div class="boton-texto">
              <span class="boton-nombre">Ventas diarias</span>
              <span class="boton-desc">Historial y totales por día</span>
            </div>
            <ion-icon name="chevron-forward-outline" class="boton-flecha" />
          </button>

          <button class="boton-reporte" @click="irEstimaciones">
            <div class="boton-icono-wrap negro">
              <ion-icon name="analytics-outline" />
            </div>
            <div class="boton-texto">
              <span class="boton-nombre">Estimaciones</span>
              <span class="boton-desc">Demanda proyectada y cobertura</span>
            </div>
            <ion-icon name="chevron-forward-outline" class="boton-flecha" />
          </button>

          <button class="boton-reporte" @click="irPrediccionInsumos">
            <div class="boton-icono-wrap naranja">
              <ion-icon name="trending-up-outline" />
            </div>
            <div class="boton-texto">
              <span class="boton-nombre">Predicción de insumos</span>
              <span class="boton-desc">Consumo y duración del stock</span>
            </div>
            <ion-icon name="chevron-forward-outline" class="boton-flecha" />
          </button>

          <button class="boton-reporte" @click="irPrediccionProductos">
            <div class="boton-icono-wrap negro">
              <ion-icon name="fast-food-outline" />
            </div>
            <div class="boton-texto">
              <span class="boton-nombre">Predicción de productos</span>
              <span class="boton-desc">Rotación y demanda semanal</span>
            </div>
            <ion-icon name="chevron-forward-outline" class="boton-flecha" />
          </button>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  barChartOutline, analyticsOutline, trendingUpOutline,
  fastFoodOutline, chevronForwardOutline
} from 'ionicons/icons'
import AppHeader from '@/components/AppHeader.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

addIcons({
  'bar-chart-outline': barChartOutline,
  'analytics-outline': analyticsOutline,
  'trending-up-outline': trendingUpOutline,
  'fast-food-outline': fastFoodOutline,
  'chevron-forward-outline': chevronForwardOutline
})

const router = useRouter()

const ventaHoy = ref('$0')
const productoTop = ref('—')
const insumosAlerta = ref(0)

const irVentasDiarias = () => router.push('/reportes/ventas-diarias')
const irEstimaciones = () => router.push('/reportes/estimaciones')
const irPrediccionInsumos = () => router.push('/reportes/prediccion-insumos')
const irPrediccionProductos = () => router.push('/reportes/prediccion-productos')

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/pedidos')
    const pedidos = await res.json()
    const hoy = new Date().toDateString()
    const pedidosHoy = pedidos.filter(p => new Date(p.fecha_creacion).toDateString() === hoy)
    const total = pedidosHoy.reduce((acc, p) => acc + Number(p.total || 0), 0)
    ventaHoy.value = `$${total.toLocaleString('es-CO')}`

    // Producto top del día
    const conteo = {}
    pedidosHoy.forEach(p => {
      try {
        const recibo = typeof p.recibo_json === 'string' ? JSON.parse(p.recibo_json) : p.recibo_json
        recibo?.items?.forEach(item => {
          conteo[item.nombre] = (conteo[item.nombre] || 0) + (item.cantidad || 1)
        })
      } catch {}
    })
    const top = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]
    if (top) productoTop.value = top[0]

    // Alertas de stock
    const resCat = await fetch('http://localhost:3000/categorias')
    const cats = await resCat.json()
    let alertas = 0
    for (const cat of cats) {
      const resProd = await fetch(`http://localhost:3000/productos/${cat.id}`)
      const prods = await resProd.json()
      alertas += prods.filter(p => Number(p.cantidad) <= Number(p.minimo)).length
    }
    insumosAlerta.value = alertas
  } catch {}
})
</script>

<style scoped>
.fondo-reportes { --background: #f7f7f7; }

.contenedor-reportes {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 16px;
  max-width: 500px;
  margin: 0 auto;
}

/* ── Resumen ejecutivo ── */
.resumen-ejecutivo {
  background: linear-gradient(135deg, #0a0a0a, #1c1c1c);
  border-radius: 20px;
  padding: 18px 16px;
}

.resumen-titulo {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #888;
  margin: 0 0 14px 0;
}

.resumen-fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.resumen-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.resumen-icono { font-size: 20px; }

.resumen-valor {
  font-size: 15px;
  font-weight: 900;
  color: white;
  max-width: 90px;
  text-align: center;
}

.resumen-valor.truncar {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.resumen-valor.alerta-num { color: #ff3b3b; }

.resumen-label {
  font-size: 9px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.resumen-divider {
  width: 1px;
  height: 40px;
  background: #333;
}

/* ── Grid botones ── */
.grid-botones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.boton-reporte {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px;
  border: 2px solid black;
  border-radius: 18px;
  background: white;
  color: black;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  text-align: left;
}

.boton-reporte:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.boton-icono-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
  color: white;
}

.boton-icono-wrap.naranja { background: #ff7a00; }
.boton-icono-wrap.negro   { background: #1a1a1a; }

.boton-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.boton-nombre {
  font-size: 15px;
  font-weight: 800;
  color: black;
}

.boton-desc {
  font-size: 11px;
  color: #999;
}

.boton-flecha {
  font-size: 18px;
  color: #ccc;
  flex-shrink: 0;
}
</style>
