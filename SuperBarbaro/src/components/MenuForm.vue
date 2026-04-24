<template>
  <div class="contenedor">
    <input class="input" :value="nombre" placeholder="Nombre" @input="emitTexto('update:nombre', $event)" />
    <input class="input" :value="descripcion" placeholder="Descripción" @input="emitTexto('update:descripcion', $event)" />
    <input class="input" type="number" :value="precio" placeholder="Precio" @input="emitTexto('update:precio', $event)" />

    <select class="input" :value="categoriaId" @change="emitTexto('update:categoriaId', $event)">
      <option :disabled="requireCategorySelection" value="">{{ categoryPlaceholder }}</option>
      <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
        {{ categoria.nombre }}
      </option>
    </select>

    <input class="input" :value="imagenUrl" :placeholder="imageUrlPlaceholder" @input="emitTexto('update:imagenUrl', $event)" />

    <div class="input-file">
      <input class="input" :value="imagenArchivoNombre" placeholder="Seleccionar imagen..." readonly />
      <button class="btn-secundario" type="button" @click="abrirSelector">Examinar</button>
      <input ref="fileInput" type="file" hidden @change="seleccionarImagen" />
    </div>

    <button class="btn" type="button" @click="emit('submit')">{{ submitLabel }}</button>

    <button v-if="showDelete" class="btn-eliminar" type="button" @click="emit('delete')">
      {{ deleteLabel }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  nombre: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  precio: { type: [String, Number], default: '' },
  categoriaId: { type: [String, Number], default: '' },
  categorias: { type: Array, default: () => [] },
  imagenUrl: { type: String, default: '' },
  imagenArchivoNombre: { type: String, default: '' },
  submitLabel: { type: String, default: 'Guardar' },
  showDelete: { type: Boolean, default: false },
  deleteLabel: { type: String, default: 'Eliminar' },
  categoryPlaceholder: { type: String, default: 'Seleccione categoría' },
  imageUrlPlaceholder: { type: String, default: 'URL de imagen (opcional)' },
  requireCategorySelection: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:nombre',
  'update:descripcion',
  'update:precio',
  'update:categoriaId',
  'update:imagenUrl',
  'select-image',
  'submit',
  'delete'
])

const fileInput = ref(null)

const emitTexto = (eventName, event) => {
  emit(eventName, event.target.value)
}

const abrirSelector = () => {
  fileInput.value?.click()
}

const seleccionarImagen = (event) => {
  const file = event.target.files?.[0] || null
  emit('select-image', file)
}
</script>

<style scoped>
.contenedor {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
}

.input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #000;
  background: #f2f2f2;
  font-size: 14px;
  box-sizing: border-box;
}

.input-file {
  display: flex;
  gap: 8px;
  width: 100%;
}

.input-file .input {
  flex: 1;
}

.btn-secundario {
  background: #ddd;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  padding: 0 15px;
  min-width: 100px;
}

.btn {
  background: black;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  padding: 14px;
  font-weight: bold;
}

.btn-eliminar {
  background: #b00020;
  color: white;
  padding: 10px;
  border-radius: 12px;
  border: none;
  width: 50%;
  font-weight: bold;
  cursor: pointer;
}

@media (max-width: 600px) {
  .contenedor {
    padding: 15px;
  }
}
</style>
