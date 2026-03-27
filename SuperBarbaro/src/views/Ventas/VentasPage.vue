<template>

    <ion-page>

        <AppHeader titulo="VENTAS" />

        <ion-content class="fondo">

            <div class="contenedor-boton">

                <button class="boton-general" @click="NuevaOrden" style="font-size: 90px;">
                    +
                    <p style="font-size: 20px;">Nueva orden</p>
                </button>


                <button class="boton-general" @click="listaPedidos" style="font-size: 90px;">
                    =
                    <p style="font-size: 20px;">Lista de pedidos</p>
                </button>


                
            </div>

        </ion-content>

    </ion-page>

</template>

<script setup>


import { IonPage, IonContent } from '@ionic/vue'
import AppHeader from '../../components/AppHeader.vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const usuarios = ref([])



const NuevaOrden = () => {

    router.push('/nueva-orden')
}
const listaPedidos = () => {
    router.push('/nueva-orden')
}


</script>

<style>
.fondo {
    --background: white;
}

.boton-general {
    width: 170px;
    height: 200px;
    border: 2px solid black;
    border-radius: 25px;


    background: transparent;
    color: black;

    font-weight: bold;
    margin: 1%;
}
</style>
