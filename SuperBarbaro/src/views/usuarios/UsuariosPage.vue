<template>

    <ion-page>

        <AppHeader titulo="USUARIOS">

            <ion-buttons slot="start">
                <ion-button @click="volver">
                    <ion-icon :icon="chevronBackOutline"></ion-icon>
                </ion-button>
            </ion-buttons>
        </AppHeader>
        <ion-content class="fondo">

            <div class="lista">

                <div class="usuario" v-for="u in usuarios" :key="u.codigo">

                    <div class="izquierda">

                        <div class="foto-usuario">

                            <img v-if="u.foto" :src="'http://localhost:3000/' + u.foto" />

                            <ion-icon v-else :icon="person" class="icono" />

                        </div>

                        <div class="info">

                            <p class="rol">
                                {{ u.rol }}
                            </p>

                            <p class="nombre">
                                {{ u.nombre }} {{ u.apellido }}
                            </p>

                        </div>

                    </div>

                    <ion-button fill="clear" class="editar" @click="editarUsuario(u)">
                        <ion-icon :icon="createOutline"></ion-icon>
                    </ion-button>

                </div>

            </div>

            <div class="contenedor-boton">

                <button class="boton-registrar" @click="registrarUsuario">
                    REGISTRAR USUARIO
                </button>

            </div>

        </ion-content>

    </ion-page>

</template>



<script setup>

import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButtons,
    IonButton
} from '@ionic/vue'

import {
    person,
    createOutline,
    chevronBackOutline
} from 'ionicons/icons'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'


const router = useRouter()

const usuarios = ref([])

onMounted(async () => {

    try {

        const response = await fetch('http://localhost:3000/usuarios')

        const data = await response.json()

        usuarios.value = data

    } catch (error) {

        console.log("Error cargando usuarios")

    }

})

const volver = () => {

    router.push('/tabs/perfil')

}

const editarUsuario = (usuario) => {

    console.log("editar", usuario)

}

const registrarUsuario = () => {

    router.push('/registrar-usuario')

}

</script>



<style>
.fondo {
    --background: white;
}

.toolbar {
    --background: white;
    border-bottom: 2px solid black;
}

.lista {

    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    margin-top: 10px;

}

.usuario {

    width: 90%;
    max-width: 500px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    border: 2px solid black;
    border-radius: 15px;

    padding: 12px 15px;

    margin: 10px 0;

}

.izquierda {

    display: flex;
    align-items: center;

}

.foto-usuario {

    width: 35px;
    height: 35px;

    min-width: 35px;

    border-radius: 50%;

    background: black;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-right: 12px;

    overflow: hidden;

}

.foto-usuario img {

    width: 100%;
    height: 100%;
    object-fit: cover;

}

.icono {

    font-size: 16px;
    color: white;

}

.info {

    display: flex;
    flex-direction: column;

    color: black;

}

.rol {

    font-weight: bold;
    text-transform: uppercase;

    font-size: 12px;

    margin: 0;

}

.nombre {

    font-size: 13px;

    margin: 0;

}

.editar {

    color: black;

}

.contenedor-boton {

    display: flex;
    justify-content: center;

    margin-top: 25px;

}

.boton-registrar {

    width: 90%;
    max-width: 500px;

    padding: 12px;

    border: 2px solid black;
    border-radius: 25px;

    background: white;
    color: black;

    font-size: 16px;

}
</style>
