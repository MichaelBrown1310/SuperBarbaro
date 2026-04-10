<template>
    <transition name="slide">
        <div class="contenedor-alertas" :style="{ bottom: enTabs ? '90px' : '20px' }" v-if="alertas.length > 0 && !enLogin">

            <div class="alerta" v-for="a in alertas" :key="a.id">

                <span>
                    ⚠️ {{ a.nombre }} tiene bajo stock ({{ a.cantidad }})
                </span>

                <button @click="cerrar(a.id)">✖</button>

            </div>

        </div>
    </transition>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const enLogin = computed(() => {
  return route.path === '/login'
})


const alertas = ref([])
const cerradas = ref([])
let idsPrevios = [] // detectar nuevas alertas

// sonido
const beep = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = ctx.createOscillator()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, ctx.currentTime)

  osc.connect(ctx.destination)
  osc.start()

  setTimeout(() => {
    osc.stop()
    ctx.close()
  }, 200)
}

// cargar alertas
const cargar = async () => {

  const res = await fetch('http://localhost:3000/alertas-stock')
  const data = await res.json()

  // detectar nuevas alertas
  const nuevas = data.filter(a => !idsPrevios.includes(a.id))

  if (nuevas.length > 0) {
    beep()
  }

  idsPrevios = data.map(a => a.id)

  // filtrar cerradas
  alertas.value = data.filter(a => !cerradas.value.includes(a.id))

}

// cerrar alerta manual
const cerrar = (id) => {

  cerradas.value.push(id)
  alertas.value = alertas.value.filter(a => a.id !== id)

}

const enTabs = computed(() => {
  return route.path.startsWith('/tabs')
})

// recuperar cerradas
onMounted(() => {

  cargar()

  // refrescar cada 5 segundos
  setInterval(cargar, 5000)

})

</script>

<style>

.contenedor-alertas {
  position: fixed;
  right: 15px;    /*  derecha */

  width: 350px;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.alerta {
  background: #ff3b3b;
  color: white;
  padding: 12px;
  margin-top: 10px;
  border-radius: 10px;

  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.alerta button {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-enter-active {
  transition: all 0.4s ease;
}

</style>