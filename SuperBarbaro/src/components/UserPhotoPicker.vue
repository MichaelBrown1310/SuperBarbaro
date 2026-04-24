<template>
  <div>
    <input
      ref="inputFile"
      type="file"
      accept="image/*"
      style="display:none"
      @change="seleccionarArchivo"
    />

    <div class="foto" :class="{ circular }" @click="abrirArchivos">
      <img v-if="imageSrc" :src="imageSrc" />

      <div v-else-if="circular" class="foto-placeholder">
        <ion-icon :icon="person" class="icono" />
        <span v-if="placeholderText" class="texto-foto">{{ placeholderText }}</span>
      </div>

      <span v-else>{{ placeholderText || 'Seleccionar' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { person } from 'ionicons/icons'

defineProps({
  imageSrc: { type: String, default: '' },
  placeholderText: { type: String, default: '' },
  circular: { type: Boolean, default: true }
})

const emit = defineEmits(['select'])
const inputFile = ref(null)

const abrirArchivos = () => {
  inputFile.value?.click()
}

const seleccionarArchivo = (event) => {
  const file = event.target.files?.[0] || null
  emit('select', file)
}
</script>

<style scoped>
.foto {
  width: 120px;
  height: 120px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
  cursor: pointer;
}

.foto.circular {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: black;
}

.foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.foto-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.icono {
  font-size: 38px;
  color: white;
}

.texto-foto {
  font-size: 9px;
  color: white;
  text-align: center;
  font-weight: bold;
  line-height: 1.2;
  white-space: pre-line;
}
</style>
