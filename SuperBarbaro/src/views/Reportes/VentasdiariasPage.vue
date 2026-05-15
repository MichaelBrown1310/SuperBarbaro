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

        <!-- CALENDARIO SEMANAL -->
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
            <div class="exportar-wrap" v-click-outside="cerrarDropdown">
              <button class="btn-exportar" @click.stop="toggleDropdown" :disabled="exportando">
                Exportar
                <ion-icon name="chevron-down-outline" :class="{ rotado: mostrarDropdown }" />
              </button>
              <div class="dropdown" v-if="mostrarDropdown">
                <button class="dropdown-item" @click="exportarPDF">
                  <ion-icon name="document-text-outline" class="ico-pdf" />
                  <span>PDF</span>
                </button>
                <button class="dropdown-item" @click="exportarExcel">
                  <ion-icon name="grid-outline" class="ico-excel" />
                  <span>Excel</span>
                </button>
                <button class="dropdown-item" @click="exportarWord">
                  <ion-icon name="document-outline" class="ico-word" />
                  <span>Word</span>
                </button>
                <button class="dropdown-item" @click="exportarCSV">
                  <ion-icon name="list-outline" class="ico-csv" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
          <div class="subtotales">
            <div class="subtotal-fila">
              <span>Saldo semanal</span>
              <span>{{ formatear(totalSemana) }}</span>
            </div>
            <div class="subtotal-fila">
              <span>Saldo semana pasada</span>
              <span>{{ formatear(totalSemanaPasada) }}</span>
            </div>
            <div class="subtotal-fila variacion" v-if="totalSemanaPasada > 0">
              <span>Variación</span>
              <span :class="variacionSemanal >= 0 ? 'positivo' : 'negativo'">
                {{ variacionSemanal >= 0 ? '▲' : '▼' }} {{ Math.abs(variacionSemanal) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- COMPARATIVO SEMANAL -->
        <div class="seccion-comparativo">
          <div class="comparativo-header">
            <div class="comparativo-titulo">
              <ion-icon name="bar-chart-outline" />
              <strong>Comparativo semanal</strong>
            </div>
            <div class="comparativo-leyenda">
              <span class="leyenda-dot actual"></span><span>Esta semana</span>
              <span class="leyenda-dot pasada"></span><span>Semana pasada</span>
            </div>
          </div>

          <div class="grafica-barras">
            <div
              class="barra-grupo"
              v-for="(dia, i) in comparativoDias"
              :key="i"
              @click="seleccionarDia(dia.numero)"
              :class="{ seleccionado: dia.numero === diaSeleccionado }"
            >
              <div class="barras-par">
                <div class="barra-wrap">
                  <div
                    class="barra pasada"
                    :style="{ height: alturaBarra(dia.totalPasada) + 'px' }"
                    :title="'Sem. pasada: ' + formatear(dia.totalPasada)"
                  />
                </div>
                <div class="barra-wrap">
                  <div
                    class="barra actual"
                    :style="{ height: alturaBarra(dia.totalActual) + 'px' }"
                    :title="'Esta sem: ' + formatear(dia.totalActual)"
                  />
                </div>
              </div>
              <span class="barra-dia">{{ dia.nombre }}</span>
              <span class="barra-monto" v-if="dia.totalActual > 0">
                {{ abreviar(dia.totalActual) }}
              </span>
            </div>
          </div>

          <!-- Totales comparativos -->
          <div class="comparativo-totales">
            <div class="comp-total-item">
              <span class="comp-total-label">Esta semana</span>
              <span class="comp-total-val actual-color">{{ formatear(totalSemana) }}</span>
            </div>
            <div class="comp-total-divider" />
            <div class="comp-total-item">
              <span class="comp-total-label">Semana pasada</span>
              <span class="comp-total-val">{{ formatear(totalSemanaPasada) }}</span>
            </div>
            <div class="comp-total-divider" />
            <div class="comp-total-item">
              <span class="comp-total-label">Diferencia</span>
              <span class="comp-total-val" :class="totalSemana - totalSemanaPasada >= 0 ? 'positivo' : 'negativo'">
                {{ totalSemana - totalSemanaPasada >= 0 ? '+' : '' }}{{ formatear(totalSemana - totalSemanaPasada) }}
              </span>
            </div>
          </div>
        </div>

        <!-- HISTORIAL DE VENTAS -->
        <div v-if="ventasDelDia.length > 0">
          <div class="historial-header">
            <h3 class="titulo-seccion">Historial de ventas</h3>
            <span class="historial-count">{{ ventasDelDia.length }} órdenes</span>
          </div>

          <div
            class="tarjeta-orden"
            v-for="orden in ventasDelDia"
            :key="orden.id"
            @click="toggleOrden(orden.id)"
          >
            <div class="orden-header">
              <span class="orden-cliente">Orden de {{ orden.cliente }}</span>
              <ion-icon :name="ordenExpandida === orden.id ? 'chevron-up-outline' : 'chevron-down-outline'" />
            </div>
            <div class="orden-total">TOTAL <strong>{{ formatear(orden.total) }}</strong></div>

            <div class="orden-detalle" v-if="ordenExpandida === orden.id">
              <div class="detalle-fila" v-for="item in orden.items" :key="item.nombre">
                <span>{{ item.cantidad }}x {{ item.nombre }}</span>
                <span>{{ formatear(item.subtotal) }}</span>
              </div>
              <div class="detalle-fila tipo-venta">
                <span>Tipo de venta</span>
                <span class="badge" :class="orden.tipo">
                  {{ orden.tipo === 'presencial' ? 'Presencial' : 'Domicilio' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ESTADO VACÍO -->
        <div class="estado-vacio" v-else>
          <ion-icon name="receipt-outline" class="icono-vacio" />
          <p>No se completaron ventas</p>
          <p class="subtexto-vacio">Selecciona otro día en la gráfica o el calendario</p>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  chevronDownOutline, chevronUpOutline, receiptOutline,
  arrowBackOutline, barChartOutline, documentTextOutline,
  gridOutline, documentOutline, listOutline
} from 'ionicons/icons'
import AppHeader from '@/components/AppHeader.vue'
import { ref, computed, onMounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'

addIcons({
  'chevron-down-outline': chevronDownOutline,
  'chevron-up-outline': chevronUpOutline,
  'receipt-outline': receiptOutline,
  'arrow-back-outline': arrowBackOutline,
  'bar-chart-outline': barChartOutline,
  'document-text-outline': documentTextOutline,
  'grid-outline': gridOutline,
  'document-outline': documentOutline,
  'list-outline': listOutline
})

// Directiva click-outside
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value() }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) { document.removeEventListener('click', el._clickOutside) }
}

// ── Estado ──
const diaSeleccionado    = ref(null)
const ordenExpandida     = ref(null)
const todasLasVentas     = ref([])
const ventasSemanaPasada = ref([])
const exportando         = ref(false)
const mostrarDropdown    = ref(false)
const hoy                = new Date()

const toggleDropdown  = () => { mostrarDropdown.value = !mostrarDropdown.value }
const cerrarDropdown  = () => { mostrarDropdown.value = false }

// ── Semana actual ──
const inicioSemana = computed(() => {
  const d = new Date(hoy)
  const dia = d.getDay()
  d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1))
  return d
})

const diasSemana = computed(() => {
  const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return nombres.map((nombre, i) => {
    const d = new Date(inicioSemana.value)
    d.setDate(d.getDate() + i)
    const numero = d.getDate()
    const tieneVentas = todasLasVentas.value.some(v => {
      const f = new Date(v.fecha)
      return f.getDate() === numero && f.getMonth() === d.getMonth() && f.getFullYear() === d.getFullYear()
    })
    return { nombre, numero, fecha: d, tieneVentas }
  })
})

const rangoTexto = computed(() => {
  const inicio = inicioSemana.value
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + 6)
  const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  return `${fmt(inicio)} – ${fmt(fin)}`
})

// ── Ventas filtradas ──
const ventasDelDia = computed(() => {
  if (!diaSeleccionado.value) return []
  return todasLasVentas.value.filter(v => new Date(v.fecha).getDate() === diaSeleccionado.value)
})

const totalDia = computed(() => ventasDelDia.value.reduce((a, v) => a + v.total, 0))
const totalSemana = computed(() => todasLasVentas.value.reduce((a, v) => a + v.total, 0))
const totalSemanaPasada = computed(() => ventasSemanaPasada.value.reduce((a, v) => a + v.total, 0))

const variacionSemanal = computed(() => {
  if (!totalSemanaPasada.value) return 0
  return Math.round(((totalSemana.value - totalSemanaPasada.value) / totalSemanaPasada.value) * 100)
})

// ── Comparativo semanal ──
const maxComparativo = computed(() => {
  const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  const vals = nombres.flatMap((_, i) => {
    const d = new Date(inicioSemana.value)
    d.setDate(d.getDate() + i)
    const actual  = todasLasVentas.value.filter(v => new Date(v.fecha).getDate() === d.getDate()).reduce((a,v)=>a+v.total,0)
    const dPasada = new Date(d); dPasada.setDate(dPasada.getDate() - 7)
    const pasada  = ventasSemanaPasada.value.filter(v => new Date(v.fecha).getDate() === dPasada.getDate()).reduce((a,v)=>a+v.total,0)
    return [actual, pasada]
  })
  return Math.max(...vals, 1)
})

const comparativoDias = computed(() => {
  const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return nombres.map((nombre, i) => {
    const d = new Date(inicioSemana.value)
    d.setDate(d.getDate() + i)
    const numero  = d.getDate()
    const totalActual = todasLasVentas.value
      .filter(v => new Date(v.fecha).getDate() === numero)
      .reduce((a, v) => a + v.total, 0)
    const dPasada = new Date(d); dPasada.setDate(dPasada.getDate() - 7)
    const totalPasada = ventasSemanaPasada.value
      .filter(v => new Date(v.fecha).getDate() === dPasada.getDate())
      .reduce((a, v) => a + v.total, 0)
    return { nombre, numero, totalActual, totalPasada }
  })
})

const alturaBarra = (val) => Math.max((val / maxComparativo.value) * 100, val > 0 ? 4 : 0)
const abreviar = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}k` : `$${n}`

// ── Acciones ──
const toggleSemana  = () => { mostrarCalendario.value = !mostrarCalendario.value }
const seleccionarDia = (num) => { diaSeleccionado.value = num; mostrarCalendario.value = false; ordenExpandida.value = null }
const toggleOrden   = (id) => { ordenExpandida.value = ordenExpandida.value === id ? null : id }
const formatear     = (n) => `$${Number(n).toLocaleString('es-CO')}`

// ── EXPORTAR PDF ──
const exportarPDF = async () => {
  mostrarDropdown.value = false
  exportando.value = true
  try {
    const fecha = new Date().toLocaleDateString('es-CO')
    const filas = ventasDelDia.value.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.cliente}</td>
        <td>${o.tipo === 'presencial' ? 'Presencial' : 'Domicilio'}</td>
        <td>${o.items?.map(i => `${i.cantidad}x ${i.nombre}`).join(', ') || '—'}</td>
        <td style="font-weight:700;text-align:right">${formatear(o.total)}</td>
      </tr>`).join('')

    const comparativoFilas = comparativoDias.value.map(d => `
      <tr>
        <td>${d.nombre} ${d.numero}</td>
        <td style="color:#ff7a00;font-weight:700;text-align:right">${formatear(d.totalActual)}</td>
        <td style="text-align:right">${formatear(d.totalPasada)}</td>
        <td style="text-align:right;color:${d.totalActual >= d.totalPasada ? '#43a047' : '#e53935'};font-weight:700">
          ${d.totalActual - d.totalPasada >= 0 ? '+' : ''}${formatear(d.totalActual - d.totalPasada)}
        </td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Arial,sans-serif;padding:30px;color:#111}
      h1{font-size:20px;margin-bottom:2px;color:#111}
      .marca{color:#ff7a00;font-weight:800}
      .sub{color:#888;font-size:12px;margin-bottom:20px}
      .kpis{display:flex;gap:12px;margin-bottom:24px}
      .kpi{flex:1;border:2px solid #eee;border-radius:10px;padding:12px;text-align:center}
      .kpi h2{margin:4px 0;font-size:20px}.kpi p{margin:0;font-size:11px;color:#888}
      h2.sec{font-size:14px;margin:20px 0 8px;border-bottom:2px solid #eee;padding-bottom:6px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px}
      th{background:#1a1a1a;color:white;padding:9px 10px;text-align:left}
      td{padding:8px 10px;border-bottom:1px solid #f0f0f0}
      tr:nth-child(even) td{background:#fafafa}
      .footer{margin-top:20px;font-size:10px;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:12px}
    </style></head><body>
    <h1><span class="marca">SuperBarbaro</span> — Reporte de Ventas Diarias</h1>
    <p class="sub">Generado el ${fecha} | Semana: ${rangoTexto.value}</p>
    <div class="kpis">
      <div class="kpi"><p>Total del dia</p><h2>${formatear(totalDia.value)}</h2></div>
      <div class="kpi"><p>Total semana actual</p><h2>${formatear(totalSemana.value)}</h2></div>
      <div class="kpi"><p>Semana anterior</p><h2>${formatear(totalSemanaPasada.value)}</h2></div>
      <div class="kpi"><p>Variacion</p><h2 style="color:${variacionSemanal.value >= 0 ? '#43a047' : '#e53935'}">${variacionSemanal.value >= 0 ? '+' : ''}${variacionSemanal.value}%</h2></div>
    </div>
    <h2 class="sec">Ordenes del dia</h2>
    <table><thead><tr><th>#</th><th>Cliente</th><th>Tipo</th><th>Productos</th><th>Total</th></tr></thead>
    <tbody>${filas || '<tr><td colspan="5" style="text-align:center;color:#aaa">Sin ventas en este dia</td></tr>'}</tbody></table>
    <h2 class="sec">Comparativo semanal</h2>
    <table><thead><tr><th>Dia</th><th>Esta semana</th><th>Sem. anterior</th><th>Diferencia</th></tr></thead>
    <tbody>${comparativoFilas}</tbody></table>
    <p class="footer">SuperBarbaro | Sistema de gestion de food truck | ${fecha}</p>
    </body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 500)
  } finally {
    exportando.value = false
  }
}

// ── EXPORTAR EXCEL (CSV con formato) ──
const exportarExcel = async () => {
  mostrarDropdown.value = false
  exportando.value = true
  try {
    const toCSV = (arr) => {
      if (!arr.length) return ''
      const cols = Object.keys(arr[0])
      return [cols.join(','), ...arr.map(r => cols.map(c => `"${String(r[c]).replace(/"/g,'""')}"`).join(','))].join('\n')
    }
    const ordenesData = ventasDelDia.value.map(o => ({
      'ID': o.id, 'Cliente': o.cliente,
      'Tipo': o.tipo === 'presencial' ? 'Presencial' : 'Domicilio',
      'Productos': o.items?.map(i => `${i.cantidad}x ${i.nombre}`).join(' | ') || '—',
      'Total': o.total
    }))
    const compData = comparativoDias.value.map(d => ({
      'Dia': d.nombre, 'Esta semana': d.totalActual, 'Semana anterior': d.totalPasada,
      'Diferencia': d.totalActual - d.totalPasada,
      'Variacion %': d.totalPasada > 0 ? `${Math.round(((d.totalActual - d.totalPasada) / d.totalPasada) * 100)}%` : '—'
    }))
    const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g,'-')
    const contenido = [
      `SuperBarbaro - Reporte de Ventas Diarias`,
      `Generado: ${new Date().toLocaleDateString('es-CO')} | Semana: ${rangoTexto.value}`,
      `Total dia: ${formatear(totalDia.value)} | Total semana: ${formatear(totalSemana.value)} | Variacion: ${variacionSemanal.value}%`,
      '', 'ORDENES DEL DIA', toCSV(ordenesData) || 'Sin ventas',
      '', 'COMPARATIVO SEMANAL', toCSV(compData)
    ].join('\n')
    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ventas_${fecha}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  } finally { exportando.value = false }
}

// ── EXPORTAR WORD (HTML descargable) ──
const exportarWord = async () => {
  mostrarDropdown.value = false
  exportando.value = true
  try {
    const fecha = new Date().toLocaleDateString('es-CO')
    const filas = ventasDelDia.value.map(o => `
      <tr>
        <td>${o.id}</td><td>${o.cliente}</td>
        <td>${o.tipo === 'presencial' ? 'Presencial' : 'Domicilio'}</td>
        <td>${o.items?.map(i => `${i.cantidad}x ${i.nombre}`).join(', ') || '—'}</td>
        <td>${formatear(o.total)}</td>
      </tr>`).join('')
    const compFilas = comparativoDias.value.map(d => `
      <tr>
        <td>${d.nombre} ${d.numero}</td>
        <td>${formatear(d.totalActual)}</td>
        <td>${formatear(d.totalPasada)}</td>
        <td>${d.totalActual - d.totalPasada >= 0 ? '+' : ''}${formatear(d.totalActual - d.totalPasada)}</td>
      </tr>`).join('')

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8">
    <style>
      body{font-family:Arial,sans-serif;margin:2cm;color:#111}
      h1{font-size:18pt;color:#ff7a00}h2{font-size:13pt;border-bottom:1pt solid #ccc;padding-bottom:4pt}
      table{border-collapse:collapse;width:100%;margin-bottom:14pt;font-size:10pt}
      th{background:#1a1a1a;color:white;padding:6pt 8pt;text-align:left}
      td{padding:5pt 8pt;border-bottom:1pt solid #eee}
      .kpi-row{display:flex;gap:10pt;margin-bottom:16pt}
      .kpi{border:1pt solid #ddd;padding:8pt;flex:1;text-align:center}
      .kpi-val{font-size:16pt;font-weight:bold}
      .kpi-lab{font-size:8pt;color:#888}
      .footer{font-size:8pt;color:#aaa;text-align:center;margin-top:20pt}
    </style></head><body>
    <h1>SuperBarbaro &mdash; Reporte de Ventas Diarias</h1>
    <p style="color:#888;font-size:10pt">Generado el ${fecha} | Semana: ${rangoTexto.value}</p>
    <table><tr>
      <td class="kpi"><div class="kpi-lab">Total del dia</div><div class="kpi-val">${formatear(totalDia.value)}</div></td>
      <td class="kpi"><div class="kpi-lab">Total semana</div><div class="kpi-val">${formatear(totalSemana.value)}</div></td>
      <td class="kpi"><div class="kpi-lab">Sem. anterior</div><div class="kpi-val">${formatear(totalSemanaPasada.value)}</div></td>
      <td class="kpi"><div class="kpi-lab">Variacion</div><div class="kpi-val">${variacionSemanal.value >= 0 ? '+' : ''}${variacionSemanal.value}%</div></td>
    </tr></table>
    <h2>Ordenes del dia</h2>
    <table><thead><tr><th>#</th><th>Cliente</th><th>Tipo</th><th>Productos</th><th>Total</th></tr></thead>
    <tbody>${filas || '<tr><td colspan="5">Sin ventas en este dia</td></tr>'}</tbody></table>
    <h2>Comparativo semanal</h2>
    <table><thead><tr><th>Dia</th><th>Esta semana</th><th>Sem. anterior</th><th>Diferencia</th></tr></thead>
    <tbody>${compFilas}</tbody></table>
    <p class="footer">SuperBarbaro | Sistema de gestion de food truck | ${fecha}</p>
    </body></html>`

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ventas_${new Date().toLocaleDateString('es-CO').replace(/\//g,'-')}.doc`
    a.click()
    URL.revokeObjectURL(a.href)
  } finally { exportando.value = false }
}

// ── EXPORTAR CSV ──
const exportarCSV = async () => {
  mostrarDropdown.value = false
  exportando.value = true
  try {
    const filas = ventasDelDia.value.map(o =>
      [o.id, o.cliente, o.tipo, o.items?.map(i=>`${i.cantidad}x ${i.nombre}`).join(' | '), o.total].map(v=>`"${v}"`).join(',')
    )
    const contenido = [
      '"ID","Cliente","Tipo","Productos","Total"',
      ...filas
    ].join('\n')
    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ventas_${new Date().toLocaleDateString('es-CO').replace(/\//g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  } finally { exportando.value = false }
}

// ── Carga de datos ──
const generarFallback = (offsetSemanas = 0) => {
  const base = new Date(hoy)
  base.setDate(base.getDate() - offsetSemanas * 7)
  const dia = base.getDate()
  const mes = base.getMonth()
  const anio = base.getFullYear()
  return [
    { id: 1 + offsetSemanas * 10, cliente: 'Juan Camilo', total: 69000, tipo: 'presencial',
      fecha: new Date(anio, mes, dia).toISOString(),
      items: [{ nombre: 'Hamburguesa', cantidad: 2, subtotal: 46000 }, { nombre: 'Jugo', cantidad: 1, subtotal: 23000 }] },
    { id: 2 + offsetSemanas * 10, cliente: 'Michael Moreno', total: 37000, tipo: 'domicilio',
      fecha: new Date(anio, mes, dia).toISOString(),
      items: [{ nombre: 'Perro caliente', cantidad: 1, subtotal: 15000 }, { nombre: 'Papas', cantidad: 2, subtotal: 22000 }] },
    { id: 3 + offsetSemanas * 10, cliente: 'Carlos Martínez', total: 102500, tipo: 'presencial',
      fecha: new Date(anio, mes, dia - 1).toISOString(),
      items: [{ nombre: 'Combo familiar', cantidad: 1, subtotal: 85000 }, { nombre: 'Bebida', cantidad: 3, subtotal: 17500 }] },
    { id: 4 + offsetSemanas * 10, cliente: 'Laura Gómez', total: 45000, tipo: 'presencial',
      fecha: new Date(anio, mes, dia - 2).toISOString(),
      items: [{ nombre: 'Sandwich', cantidad: 2, subtotal: 45000 }] },
    { id: 5 + offsetSemanas * 10, cliente: 'Pedro Ruiz', total: 58000, tipo: 'domicilio',
      fecha: new Date(anio, mes, dia - 3).toISOString(),
      items: [{ nombre: 'Hamburguesa doble', cantidad: 1, subtotal: 38000 }, { nombre: 'Papas', cantidad: 2, subtotal: 20000 }] },
  ]
}

const cargar = async () => {
  try {
    const [r1, r2] = await Promise.all([
      fetch('https://superbarbaro.onrender.com/ventas'),
      fetch('https://superbarbaro.onrender.com/ventas?semana=anterior')
    ])
    todasLasVentas.value = await r1.json()
    ventasSemanaPasada.value = await r2.json()
  } catch {
    todasLasVentas.value = generarFallback(0)
    ventasSemanaPasada.value = generarFallback(1)
    diaSeleccionado.value = hoy.getDate()
  }
}

onIonViewWillEnter(cargar)
onMounted(cargar)
</script>

<style scoped>
.fondo-reportes { --background: white; }

.contenedor {
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
  color: black;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Selector semana ── */
.selector-semana {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid black;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.selector-semana ion-icon { font-size: 18px; transition: transform 0.2s; }
.selector-semana ion-icon.rotado { transform: rotate(180deg); }

/* ── Calendario ── */
.calendario {
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  border-radius: 14px;
  padding: 10px 8px;
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
}

.dia.activo { background: black; color: white; }
.dia-nombre { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
.dia-numero { font-size: 16px; font-weight: bold; }
.punto-ventas { width: 5px; height: 5px; border-radius: 50%; background: black; }
.dia.activo .punto-ventas { background: white; }

/* ── Panel total ── */
.panel-total {
  border: 2px solid black;
  border-radius: 16px;
  padding: 16px;
}

.total-principal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.monto { font-size: 26px; font-weight: bold; }

.botones-exportar { display: flex; gap: 8px; }

.btn-exp {
  display: flex;
  align-items: center;
  gap: 5px;
  border: none;
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  color: white;
}

.btn-exp:disabled { opacity: 0.6; }
.btn-exp.pdf   { background: #ff7a00; }
.btn-exp.excel { background: #1a6e36; }
.btn-exp ion-icon { font-size: 14px; }.subtotales {
  border-top: 1px solid #ddd;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.subtotal-fila {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
}

.subtotal-fila.variacion { margin-top: 2px; }
.positivo { color: #43a047; font-weight: 800; }
.negativo { color: #e53935; font-weight: 800; }

/* ── Dropdown exportar ── */
.exportar-wrap {
  position: relative;
}

.btn-exportar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #2a7a2a;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.btn-exportar:disabled { opacity: 0.6; }
.btn-exportar ion-icon { font-size: 14px; transition: transform 0.2s; }
.btn-exportar ion-icon.rotado { transform: rotate(180deg); }

.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  min-width: 140px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  border: none;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #222;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.dropdown-item:hover { background: #f5f5f5; }
.dropdown-item:not(:last-child) { border-bottom: 1px solid #f0f0f0; }
.dropdown-item ion-icon { font-size: 18px; }

.ico-pdf   { color: #e53935; }
.ico-excel { color: #1a6e36; }
.ico-word  { color: #1565c0; }
.ico-csv   { color: #ff7a00; }


.seccion-comparativo {
  border: 2px solid black;
  border-radius: 16px;
  padding: 16px;
}

.comparativo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.comparativo-titulo {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 800;
}

.comparativo-leyenda {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #666;
}

.leyenda-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.leyenda-dot.actual  { background: #ff7a00; }
.leyenda-dot.pasada  { background: #d0d0d0; }

/* Gráfica */
.grafica-barras {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 130px;
  padding-bottom: 6px;
  border-bottom: 2px solid #eee;
  margin-bottom: 12px;
}

.barra-grupo {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 3px 2px;
  border-radius: 8px;
  transition: background 0.15s;
}

.barra-grupo:hover    { background: #f5f5f5; }
.barra-grupo.seleccionado { background: #fff3e0; }

.barras-par {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 100px;
}

.barra-wrap {
  width: 14px;
  height: 100px;
  display: flex;
  align-items: flex-end;
}

.barra {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 3px;
  transition: height 0.4s ease;
}

.barra.actual  { background: #ff7a00; }
.barra.pasada  { background: #d0d0d0; }

.barra-dia {
  font-size: 9px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
}

.barra-monto {
  font-size: 8px;
  font-weight: 800;
  color: #ff7a00;
}

/* Totales comparativos */
.comparativo-totales {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 10px 14px;
  margin-top: 4px;
}

.comp-total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.comp-total-label { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.4px; }
.comp-total-val   { font-size: 13px; font-weight: 800; color: black; }
.comp-total-val.actual-color { color: #ff7a00; }
.comp-total-divider { width: 1px; height: 30px; background: #e0e0e0; }

/* ── Historial ── */
.historial-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.titulo-seccion { font-size: 15px; font-weight: bold; letter-spacing: 0.3px; margin: 0; }
.historial-count { font-size: 12px; color: #999; font-weight: 600; }

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

.orden-cliente { font-weight: 600; font-size: 14px; }
.orden-total   { font-size: 13px; color: #555; }
.orden-total strong { color: black; }

.orden-detalle {
  margin-top: 12px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detalle-fila { display: flex; justify-content: space-between; font-size: 13px; }
.tipo-venta   { align-items: center; margin-top: 4px; }

.badge { padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1.5px solid black; }
.badge.presencial { background: black; color: white; }
.badge.domicilio  { background: white; color: black; }

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

.icono-vacio    { font-size: 52px; margin-bottom: 12px; color: #ccc; }
.subtexto-vacio { font-size: 13px; margin-top: 6px; color: #aaa; }
</style>
