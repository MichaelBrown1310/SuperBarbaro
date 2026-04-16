<template>
    <ion-page>
        <AppHeader titulo="NUEVO PLATO" />

        <ion-content class="fondo">
            <div class="contenedor">

                <input v-model="nombre" placeholder="Nombre" class="input" />
                <input v-model="descripcion" placeholder="Descripción" class="input" />
                <input v-model="precio" type="number" placeholder="Precio" class="input" />

                <select v-model="categoria_id" class="input">
                    <option value="">Seleccione categoría</option>
                    <option v-for="c in categorias" :key="c.id" :value="c.id">
                        {{ c.nombre }}
                    </option>
                </select>

                <input class="input" v-model="imagenUrl" placeholder="URL de imagen (opcional)" />

                <!-- FILE BONITO -->
                <div class="input-file">
                    <input class="input" :value="imagenNombre" placeholder="Seleccionar imagen..." readonly />
                    <button class="btn-secundario" @click="abrirFile">Examinar</button>
                    <input type="file" ref="fileInput" @change="seleccionarImagen" hidden />
                </div>

                <button class="btn" @click="guardar">Guardar</button>

            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()

const nombre = ref('')
const descripcion = ref('')
const precio = ref('')
const categoria_id = ref('')
const categorias = ref([])

const imagenUrl = ref('')
const imagenArchivo = ref(null)
const imagenNombre = ref('')
const fileInput = ref(null)

const abrirFile = () => fileInput.value.click()

const seleccionarImagen = (e) => {
    const file = e.target.files[0]
    imagenArchivo.value = file
    imagenNombre.value = file ? file.name : ''
}

const cargar = async () => {

    // 1. cargar categorias
    const resCat = await fetch('http://localhost:3000/categorias')
    categorias.value = await resCat.json()

    // 2. cargar producto
    const res = await fetch(`http://localhost:3000/menu/${id}`)
    const data = await res.json()

    console.log(data) // 👈 mira esto en consola

    nombre.value = data.nombre
    descripcion.value = data.descripcion
    precio.value = data.precio
    categoria_id.value = data.categoria_id || ''
    imagenUrl.value = data.imagen
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

    await fetch('http://localhost:3000/menu', {
        method: 'POST',
        body: formData
    })

    alert('Creado correctamente')
    router.push('/menu')
}
</script>

<style>
.contenedor {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 650px;
    /* mismo ancho que buscador */
    margin: 0 auto;
    /* centrado */
}

/* INPUTS */
.input {
    width: 100%;
    /* todos mismo ancho */
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #000;
    background: #f2f2f2;
    font-size: 14px;
    box-sizing: border-box;
}

/* FILE INPUT */
.input-file {
    display: flex;
    gap: 8px;
    width: 100%;
}

.input-file .input {
    flex: 1;
    /* ocupa todo el espacio */
}

/* BOTON EXAMINAR */
.btn-secundario {
    background: #ddd;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    padding: 0 15px;
    /* horizontal */
    height: 44px;
    /* MISMA ALTURA QUE INPUT */
    display: flex;
    align-items: center;
}

.btn-secundario:hover {
    background: #ccc;
}

/* BOTON GUARDAR */
.btn {
    background: black;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    width: 100%;
    /* MISMO ANCHO QUE INPUTS */
    padding: 14px;
    font-weight: bold;
}

.btn:hover {
    background: #222;
}
</style>