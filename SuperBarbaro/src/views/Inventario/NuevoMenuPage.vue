<template>
  <ion-page>
    <AppHeader titulo="NUEVO PLATO" />

    <ion-content class="fondo">
      <MenuForm
        v-model:nombre="nombre"
        v-model:descripcion="descripcion"
        v-model:precio="precio"
        v-model:categoria-id="categoria_id"
        v-model:imagen-url="imagenUrl"
        :categorias="categorias"
        :imagen-archivo-nombre="imagenNombre"
        submit-label="Guardar"
        @select-image="seleccionarImagen"
        @submit="guardar"
      />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import MenuForm from '@/components/MenuForm.vue'

const router = useRouter()

const nombre = ref('')
const descripcion = ref('')
const precio = ref('')
const categoria_id = ref('')
const categorias = ref([])
const imagenUrl = ref('')
const imagenArchivo = ref(null)
const imagenNombre = ref('')

const seleccionarImagen = (file) => {
  imagenArchivo.value = file
  imagenNombre.value = file ? file.name : ''
}

const cargar = async () => {
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

  await fetch('https://superbarbaro.onrender.com/menu', {
    method: 'POST',
    body: formData
  })

  alert('Creado correctamente')
  router.push('/menu')
}
</script>

<style>
</style>
