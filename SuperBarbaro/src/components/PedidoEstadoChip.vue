<template>
  <span class="estado-chip" :class="estadoClase">
    {{ estadoTexto }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  estado: { type: String, default: '' }
})

const mapaEstados = {
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  completado: 'Completado',
  cancelado: 'Cancelado',
  listo: 'Listo',
  entregado: 'Entregado'
}

const estadoTexto = computed(() => mapaEstados[props.estado] || props.estado)

const estadoClase = computed(() => ({
  pendiente: props.estado === 'pendiente',
  preparacion: props.estado === 'en_preparacion',
  completado: props.estado === 'completado',
  cancelado: props.estado === 'cancelado',
  listo: props.estado === 'listo',
  entregado: props.estado === 'entregado'
}))
</script>

<style scoped>
.estado-chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid transparent;
}

.estado-chip.pendiente {
  background: #fff1b8;
  border-color: #eab308;
}

.estado-chip.preparacion {
  background: #fde68a;
  border-color: #d97706;
}

.estado-chip.completado,
.estado-chip.entregado {
  background: #bbf7d0;
  border-color: #16a34a;
}

.estado-chip.cancelado {
  background: #fecaca;
  border-color: #dc2626;
}

.estado-chip.listo {
  background: #bfdbfe;
  border-color: #2563eb;
}
</style>
