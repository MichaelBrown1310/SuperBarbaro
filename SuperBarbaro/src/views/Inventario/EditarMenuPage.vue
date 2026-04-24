<template>
  <ion-page>
    <AppHeader titulo="EDITAR PLATO" />

    <ion-content class="fondo">
      <MenuForm
        v-model:nombre="nombre"
        v-model:descripcion="descripcion"
        v-model:precio="precio"
        v-model:categoria-id="categoria_id"
        v-model:imagen-url="imagenUrl"
        :categorias="categorias"
        :imagen-archivo-nombre="imagenArchivo?.name || ''"
        submit-label="Guardar cambios"
        :show-delete="true"
        delete-label="Eliminar producto"
        :require-category-selection="true"
        image-url-placeholder="URL imagen"
        @select-image="seleccionarImagen"
        @submit="guardar"
        @delete="eliminar"
      />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'
import MenuForm from '@/components/MenuForm.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const nombre = ref('')
const descripcion = ref('')
const precio = ref('')
const categoria_id = ref('')
const categorias = ref([])
const imagenUrl = ref('')
const imagenArchivo = ref(null)

const seleccionarImagen = (file) => {
  imagenArchivo.value = file
}

const cargar = async () => {
  const res = await fetch(`https://superbarbaro.onrender.com/menu-id/${id}`)
  const data = await res.json()

  nombre.value = data.nombre
  descripcion.value = data.descripcion
  precio.value = data.precio
  categoria_id.value = data.categoria_id || ''
  imagenUrl.value = data.imagen

  const resCat = await fetch('https://superbarbaro.onrender.com/categorias')
  categorias.value = await resCat.json()
}

onMounted(cargar)

const guardar = async () => {
  if (!nombre.value.trim()) {
    alert('El nombre es obligatorio')
    return
  }

  if (!precio.value || Number(precio.value) <= 0) {
    alert('El precio es obligatorio y debe ser mayor a 0')
    return
  }

  if (!categoria_id.value) {
    alert('Debe seleccionar una categoría')
    return
  }

  const formData = new FormData()
  formData.append('nombre', nombre.value)
  formData.append('descripcion', descripcion.value)
  formData.append('precio', precio.value)
  formData.append('categoria_id', categoria_id.value)

  if (imagenArchivo.value) {
    formData.append('imagen', imagenArchivo.value)
  } else {
    formData.append('imagen_url', imagenUrl.value)
  }

  await fetch(`https://superbarbaro.onrender.com/menu/${id}`, {
    method: 'PUT',
    body: formData
  })

  alert('Editado correctamente')
  router.push('/menu')
}

const eliminar = async () => {
  if (!confirm('¿Eliminar definitivamente?')) return

  await fetch(`https://superbarbaro.onrender.com/menu/${id}`, {
    method: 'DELETE'
  })

  router.push('/menu')
}
</script>

<style>
</style>
