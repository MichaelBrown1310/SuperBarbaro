<template>
    <ion-page>
        <AppHeader titulo="EDITAR PLATO" />

        <ion-content class="fondo">
            <div class="contenedor">

                <input class="input" v-model="nombre" placeholder="Nombre" />
                <input class="input" v-model="descripcion" placeholder="Descripción" />
                <input class="input" type="number" v-model="precio" placeholder="Precio" />

                <select class="input" v-model="categoria_id">
                    <option disabled value="">Seleccione categoría</option>

                    <option v-for="c in categorias" :key="c.id" :value="c.id">
                        {{ c.nombre }}
                    </option>
                </select>


                <input class="input" v-model="imagenUrl" placeholder="URL imagen" />

                <!-- FILE -->
                <div class="input-file">
                    <input class="input" :value="imagenArchivo?.name || ''" placeholder="Seleccionar imagen..."
                        readonly />
                    <button class="btn-secundario" @click="$refs.file.click()">Examinar</button>
                    <input type="file" ref="file" @change="seleccionarImagen" hidden />
                </div>

                <button class="btn" @click="guardar">Guardar cambios</button>
                <br>
                <button class="btn-eliminar" @click="eliminar">
                    Eliminar producto
                </button>

            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'

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

const seleccionarImagen = (e) => {
    imagenArchivo.value = e.target.files[0]
}

const cargar = async () => {
    const res = await fetch(`http://localhost:3000/menu-id/${id}`)
    const data = await res.json()

    nombre.value = data.nombre
    descripcion.value = data.descripcion
    precio.value = data.precio
    categoria_id.value = data.categoria_id || ''
    imagenUrl.value = data.imagen

    const resCat = await fetch('http://localhost:3000/categorias')
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

    await fetch(`http://localhost:3000/menu/${id}`, {
        method: 'PUT',
        body: formData
    })

    alert(' Editado correctamente')
    router.push('/menu')
}

const eliminar = async () => {
    if (!confirm('¿Eliminar definitivamente?')) return

    await fetch(`http://localhost:3000/menu/${id}`, {
        method: 'DELETE'
    })

    router.push('/menu')
}
</script>

<style>
.contenedor {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    max-width: 650px;
    /* mismo ancho que buscador */
    margin: 0 auto;
    /* centrar */
    width: 100%;
}

/* INPUTS */
.input {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #000;
    background: #f2f2f2;
    width: 100%;
    /* todos mismo ancho */
    box-sizing: border-box;
}

/* FILE INPUT BONITO */
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
    border-radius: 10px;
    border: none;
    padding: 15px;
    height: 100%;
    /* misma altura del input */
    min-width: 100px;
    cursor: pointer;
}

.btn-secundario:hover {
    background: #ccc;
}

/* BOTON GUARDAR */
.btn {
    background: black;
    color: white;
    padding: 14px;
    border-radius: 12px;
    border: none;
    width: 100%;
    /* mismo ancho que inputs */
    font-weight: bold;
    cursor: pointer;
}

.btn:hover {
    background: #222;
}

/* BOTON ELIMINAR */
.btn-eliminar {
    background: #b00020;
    color: white;
    padding: 10px;
    border-radius: 12px;
    border: none;
    width: 50%;
    /* igual de ancho */
    font-weight: bold;
    cursor: pointer;
}

.btn-eliminar:hover {
    background: #8a0018;
}

/* RESPONSIVE */
@media (max-width: 600px) {
    .contenedor {
        padding: 15px;
    }
}
</style>