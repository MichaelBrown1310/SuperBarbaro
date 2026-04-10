<template>

    <ion-page>

        <AppHeader titulo="REGISTRAR">

            <ion-buttons slot="start">
                <ion-button @click="volver">
                    <ion-icon :icon="chevronBackOutline"></ion-icon>
                </ion-button>
            </ion-buttons>
        </AppHeader>
        <ion-content class="fondo">

            <div class="contenedor">

                <input type="file" ref="inputFoto" accept="image/*" style="display:none" @change="cargarFoto" />

                <div class="foto" @click="abrirArchivos">

                    <img v-if="foto" :src="foto">

                    <ion-icon v-else :icon="person" class="icono"></ion-icon>

                </div>

                <input class="input" placeholder="Código" v-model="codigo" />

                <input class="input" placeholder="Nombre" v-model="nombre" />
                <input class="input" placeholder="Apellido" v-model="apellido" />
                <input class="input" placeholder="Cédula" v-model="cedula" />

                <input class="input" placeholder="Correo" v-model="correo" />
                <input class="input" placeholder="Teléfono" v-model="telefono" />
                <input class="input" placeholder="Dirección" v-model="direccion" />

                <select v-model="rol" class="input">

                    <option disabled value="">Seleccionar rol</option>

                    <option value="CAJERO">Cajero</option>
                    <option value="COCINERO">Cocinero</option>

                </select>

                <input class="input" type="password" placeholder="Contraseña" v-model="password" />
                <br>
                <button class="boton" @click="registrar">
                    REGISTRAR
                </button>
                <br><br>

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
    IonButtons,
    IonButton,
    IonIcon
} from '@ionic/vue'

import {
    person,
    chevronBackOutline
} from 'ionicons/icons'
import AppHeader from '@/components/AppHeader.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
const esAdministrador = computed(() => {
    const rol = (usuario?.rol || '').toString().trim().toUpperCase()
    return rol === 'ADMINISTRADOR'
})

const codigo = ref('')
const nombre = ref('')
const apellido = ref('')
const cedula = ref('')
const correo = ref('')
const telefono = ref('')
const direccion = ref('')
const rol = ref('')
const password = ref('')

const foto = ref(null)

const inputFoto = ref(null)

const abrirArchivos = () => {

    inputFoto.value.click()

}

const cargarFoto = (event) => {

    const file = event.target.files[0]

    if (file) {

        foto.value = URL.createObjectURL(file)

    }

}

const registrar = async () => {

    if (!esAdministrador.value) {
        return
    }

    if (
        !codigo.value ||
        !nombre.value ||
        !apellido.value ||
        !password.value ||
        !rol.value
    ) {

        alert("Debes llenar los campos obligatorios")
        return

    }

    try {

        const response = await fetch('http://localhost:3000/usuarios', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({

                codigo: codigo.value,
                password: password.value,
                nombre: nombre.value,
                apellido: apellido.value,
                cedula: cedula.value,
                direccion: direccion.value,
                correo: correo.value,
                telefono: telefono.value,
                rol: rol.value,
                foto: foto.value

            })

        })

        const data = await response.json()

        if (data.success) {

            alert("Usuario registrado")

            router.push('/usuarios')

        } else {

            alert("Error registrando usuario")

        }

    } catch (error) {

        console.log(error)

    }

}

const volver = () => {

    router.push('/usuarios')

}

onMounted(() => {
    if (!esAdministrador.value) {
        window.alert('No tienes permisos para acceder a usuarios')
        window.location.replace('/tabs/perfil')
    }
})

</script>


<style>
.fondo {
    --background: white;
}

.toolbar {
    --background: white;
    border-bottom: 2px solid black;
}

.contenedor {

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;

}

.foto {

    width: 100px;
    height: 100px;

    border-radius: 50%;

    background: black;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 25px;

    overflow: hidden;

    cursor: pointer;

}

.foto img {

    width: 100%;
    height: 100%;
    object-fit: cover;

}

.icono {

    font-size: 50px;
    color: white;

}

.input {

    width: 85%;

    padding: 10px;

    border: none;

    border-bottom: 2px solid black;

    margin-bottom: 20px;

    font-size: 16px;

    background: white;

    color: black;

    

}

.boton {

    width: 85%;

    padding: 15px;

    border: 2px solid black;

    border-radius: 25px;

    background: white;

    color: black;

    font-size: 16px;

    cursor: pointer;


}
</style>
