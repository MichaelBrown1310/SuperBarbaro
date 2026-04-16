<template>
    <ion-page>

        <AppHeader titulo="HISTORIAL DE VENTAS" :mostrarVolver="true" @volver="volver" />

        <ion-content class="fondo">

            <div class="contenedor">

                <!-- FILTRO -->
                <div class="filtro">

                    <input type="date" v-model="fecha" class="input-fecha" />

                    <button class="btn-buscar" @click="buscar">
                        Buscar
                    </button>

                </div>


                <!-- LISTA -->
                <div v-for="p in pedidos" :key="p.id" class="pedido">

                    <!-- TOP -->
                    <div class="fila-top">
                        <span class="blanco">- - - - - - -</span>
                        <span class="numero">#{{ p.numero_pedido }} </span>
                        <span class="blanco">- - - - - - -</span>
                    </div>

                    <div>
                        <span class="fecha">fecha: {{ formatearFecha(p.fecha_creacion) }}</span>
                    </div>

                    <!-- INFO -->
                    <div class="fila">
                        <span>nombre: {{ p.cliente_nombre || 'Sin nombre' }}</span>
                    </div>
                    <div class="fila">
                        <span>tipo de servicio: {{ p.tipo_servicio }}</span>
                    </div>

                    <!-- FOOTER -->
                    <div class="fila-bottom">
                        <span class="estado">{{ p.estado }}</span>
                        <span class="total">Total: ${{ p.total }}</span>
                    </div>

                </div>

            </div>

        </ion-content>

    </ion-page>
</template>

<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const pedidos = ref([])
const fecha = ref('')

onMounted(() => {
    cargarPedidos()
})

const cargarPedidos = async () => {
    const res = await fetch('http://localhost:3000/pedidos')
    const data = await res.json()
    pedidos.value = data
}

const buscar = async () => {
    if (!fecha.value) {
        cargarPedidos()
        return
    }

    const res = await fetch(`http://localhost:3000/pedidos?fecha=${fecha.value}`)
    const data = await res.json()
    pedidos.value = data
}

const volver = () => {
    router.push('/tabs/ventas')
}

const formatearFecha = (f) => {
    const fecha = new Date(f)

    return fecha.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

</script>

<style scoped>
.fondo {
    --background: white;
}

.contenedor {
  width: 95%;
  max-width: 1400px;
  margin: 25px auto;
  padding: 0 20px;
  box-sizing: border-box;
  color: black;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 👈 3 columnas */
  gap: 20px;
}

.input-fecha {
    flex: 1;
    padding: 12px;
    border: 2px solid black;
    border-radius: 10px;
    font-size: 14px;
    background-color: rgb(251, 237, 237);
    color: black;
}

.input-fecha::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.pedido {
    border: 2px solid black;
    border-radius: 18px;
    padding: 18px;
    margin-bottom: 18px;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
}

.fila {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}

.fila-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.fila-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.numero {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
}

.fecha {
    font-size: 15px;
    font-weight: bold;
    color: #080808;
}

.fechaderecha{
    text-align: center;
}

.estado {
    font-size: 12px;
    font-weight: bold;
    padding: 4px 10px;
    border-radius: 10px;
    border: 1px solid black;
}

.filtro {
    grid-column: 1 / -1;
    display: flex;
    gap: 12px;
    margin-bottom: 25px;
}

.btn-buscar {
    padding: 12px 18px;
    border-radius: 10px;
    border: 2px solid black;
    background: black;
    color: white;
    cursor: pointer;
    font-weight: bold;
}

.total {
    font-size: 18px;
    font-weight: bold;
}

.blanco{
    color: white;
}

/* Tablets */
@media (max-width: 900px) {
  .contenedor {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Celulares */
@media (max-width: 500px) {
  .contenedor {
    grid-template-columns: 1fr;
  }
}

</style>
