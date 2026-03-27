<template>
  <ion-page>
    <AppHeader titulo="VENTAS DIARIAS" :mostrarVolver="true" />

    <ion-content class="fondo-reportes">
      <div class="contenedor">

        <!-- SELECTOR DE SEMANA -->
        <div class="selector-semana" @click="toggleSemana">
          <span class="rango-texto">{{ rangoTexto }}</span>
          <ion-icon name="chevron-down-outline" :class="{ rotado: mostrarCalendario }" />
        </div>

        <!-- CALENDARIO SEMANAL (desplegable) -->
        <div class="calendario" v-if="mostrarCalendario">
          <div
            v-for="dia in diasSemana"
            :key="dia.numero"
            class="dia"
            :class="{ activo: dia.numero === diaSeleccionado, 'tiene-ventas': dia.tieneVentas }"
            @click="seleccionarDia(dia.numero)"
          >
            <span class="dia-nombre">{{ dia.nombre }}</span>
            <span class="dia-numero">{{ dia.numero }}</span>
            <span v-if="dia.tieneVentas" class="punto-ventas" />
          </div>
        </div>

        <!-- PANEL TOTAL -->
        <div class="panel-total" v-if="ventasDelDia.length > 0">
          <div class="total-principal">
            <span class="monto">$ {{ formatear(totalDia) }}</span>
            <ion-icon name="chevron-down-outline" />
          </div>
          <div class="subtotales">
            <div class="subtotal-fila">
              <span>Saldo semanal</span>
              <span>{{ formatear(totalSemana) }}</span>
            </div>
            <div class="subtotal-fila">
              <span>Saldo de la semana pasada</span>
              <span>{{ formatear(totalSemanaPasada) }}</span>
            </div>
          </div>
        </div>

        <!-- HISTORIAL DE VENTAS -->
        <div v-if="ventasDelDia.length > 0">
          <h3 class="titulo-seccion">Historial de ventas</h3>

          <div
            class="tarjeta-orden"
            v-for="orden in ventasDelDia"
            :key="orden.id"
            @click="toggleOrden(orden.id)"
          >
            <div class="orden-header">
              <span class="orden-cliente">Orden de {{ orden.cliente }}</span>
              <ion-icon
                :name="ordenExpandida === orden.id ? 'chevron-up-outline' : 'chevron-down-outline'"
              />
            </div>
            <div class="orden-total">TOTAL <strong>{{ formatear(orden.total) }}</strong></div>

            <!-- Detalle expandible -->
            <div class="orden-detalle" v-if="ordenExpandida === orden.id">
              <div class="detalle-fila" v-for="item in orden.items" :key="item.nombre">
                <span>{{ item.cantidad }}x {{ item.nombre }}</span>
                <span>{{ formatear(item.subtotal) }}</span>
              </div>
              <div class="detalle-fila tipo-venta">
                <span>Tipo de venta</span>
                <span class="badge" :class="orden.tipo">{{ orden.tipo === 'presencial' ? 'Presencial' : 'Domicilio' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ESTADO VACÍO -->
        <div class="estado-vacio" v-else>
          <ion-icon name="receipt-outline" class="icono-vacio" />
          <p>No se completaron ventas</p>
          <p class="subtexto-vacio">No se encontraron registros. Selecciona otro período</p>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  chevronDownOutline, chevronUpOutline, receiptOutline
} from 'ionicons/icons'
import AppHeader from '../../components/AppHeader.vue'
import { ref, computed, onMounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'

addIcons({
  'chevron-down-outline': chevronDownOutline,
  'chevron-up-outline': chevronUpOutline,
  'receipt-outline': receiptOutline
})

// ──────────────────────────────────────────
// Estado
// ──────────────────────────────────────────
const mostrarCalendario = ref(false)
const diaSeleccionado = ref(null)
const ordenExpandida = ref(null)
const todasLasVentas = ref([])
const totalSemanaPasada = ref(847500)

// ──────────────────────────────────────────
// Lógica de semana
// ──────────────────────────────────────────
const hoy = new Date()

const inicioSemana = computed(() => {
  const d = new Date(hoy)
  d.setDate(d.getDate() - d.getDay() + 1) // lunes
  return d
})

const diasSemana = computed(() => {
  const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return nombres.map((nombre, i) => {
    const d = new Date(inicioSemana.value)
    d.setDate(d.getDate() + i)
    const numero = d.getDate()
    const tieneVentas = todasLasVentas.value.some(v => {
      const fecha = new Date(v.fecha)
      return fecha.getDate() === numero &&
        fecha.getMonth() === d.getMonth() &&
        fecha.getFullYear() === d.getFullYear()
    })
    return { nombre, numero, fecha: d, tieneVentas }
  })
})

const rangoTexto = computed(() => {
  const inicio = inicioSemana.value
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + 6)
  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  return `${fmt(inicio)} – ${fmt(fin)}`
})

// ──────────────────────────────────────────
// Ventas filtradas por día
// ──────────────────────────────────────────
const ventasDelDia = computed(() => {
  if (!diaSeleccionado.value) return []
  return todasLasVentas.value.filter(v => {
    const fecha = new Date(v.fecha)
    return fecha.getDate() === diaSeleccionado.value
  })
})

const totalDia = computed(() =>
  ventasDelDia.value.reduce((acc, v) => acc + v.total, 0)
)

const totalSemana = computed(() =>
  todasLasVentas.value.reduce((acc, v) => acc + v.total, 0)
)

// ──────────────────────────────────────────
// Acciones
// ──────────────────────────────────────────
const toggleSemana = () => {
  mostrarCalendario.value = !mostrarCalendario.value
}

const seleccionarDia = (num) => {
  diaSeleccionado.value = num
  mostrarCalendario.value = false
  ordenExpandida.value = null
}

const toggleOrden = (id) => {
  ordenExpandida.value = ordenExpandida.value === id ? null : id
}

const formatear = (n) =>
  `$${Number(n).toLocaleString('es-CO')}`

// ──────────────────────────────────────────
// Carga de datos
// ──────────────────────────────────────────
const cargar = async () => {
  try {
    const res = await fetch('http://localhost:3000/ventas')
    todasLasVentas.value = await res.json()
  } catch {
    // Datos de ejemplo mientras no hay backend
    const diaHoy = hoy.getDate()
    todasLasVentas.value = [
      {
        id: 1, cliente: 'Juan Camilo', total: 69000, tipo: 'presencial',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), diaHoy).toISOString(),
        items: [{ nombre: 'Hamburguesa', cantidad: 2, subtotal: 46000 }, { nombre: 'Jugo', cantidad: 1, subtotal: 23000 }]
      },
      {
        id: 2, cliente: 'Michael Moreno', total: 37000, tipo: 'domicilio',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), diaHoy).toISOString(),
        items: [{ nombre: 'Perro caliente', cantidad: 1, subtotal: 15000 }, { nombre: 'Papas fritas', cantidad: 2, subtotal: 22000 }]
      },
      {
        id: 3, cliente: 'Carlos Martínez', total: 102500, tipo: 'presencial',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), diaHoy).toISOString(),
        items: [{ nombre: 'Combo familiar', cantidad: 1, subtotal: 85000 }, { nombre: 'Bebida', cantidad: 3, subtotal: 17500 }]
      }
    ]
    diaSeleccionado.value = diaHoy
  }
}

onIonViewWillEnter(cargar)
onMounted(cargar)
</script>

<style scoped>
.fondo-reportes {
  --background: white;
}

.contenedor {
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}

/* ── Selector de semana ── */
.selector-semana {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid black;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.selector-semana ion-icon {
  font-size: 18px;
  transition: transform 0.2s;
}

.selector-semana ion-icon.rotado {
  transform: rotate(180deg);
}

/* ── Calendario ── */
.calendario {
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  border-radius: 14px;
  padding: 10px 8px;
  margin-bottom: 16px;
  gap: 4px;
}

.dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 6px 4px;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
}

.dia.activo {
  background: black;
  color: white;
}

.dia-nombre {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.dia-numero {
  font-size: 16px;
  font-weight: bold;
}

.punto-ventas {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: black;
}

.dia.activo .punto-ventas {
  background: white;
}

/* ── Panel total ── */
.panel-total {
  border: 2px solid black;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.total-principal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.monto {
  font-size: 26px;
  font-weight: bold;
}

.subtotales {
  border-top: 1px solid #ddd;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subtotal-fila {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
}

/* ── Historial ── */
.titulo-seccion {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 0.3px;
}

.tarjeta-orden {
  border: 2px solid black;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  cursor: pointer;
}

.orden-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.orden-cliente {
  font-weight: 600;
  font-size: 14px;
}

.orden-total {
  font-size: 13px;
  color: #555;
}

.orden-total strong {
  color: black;
}

/* ── Detalle expandible ── */
.orden-detalle {
  margin-top: 12px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detalle-fila {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.tipo-venta {
  align-items: center;
  margin-top: 4px;
}

.badge {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid black;
}

.badge.presencial {
  background: black;
  color: white;
}

.badge.domicilio {
  background: white;
  color: black;
}

/* ── Estado vacío ── */
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #888;
}

.icono-vacio {
  font-size: 52px;
  margin-bottom: 12px;
  color: #ccc;
}

.subtexto-vacio {
  font-size: 13px;
  margin-top: 6px;
  color: #aaa;
}
</style>
