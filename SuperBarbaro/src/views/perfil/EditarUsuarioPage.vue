<template>
  <ion-page>

    <AppHeader titulo="EDITAR USUARIO" :mostrarVolver="true" @volver="volver" />

    <ion-content class="fondo">
      <div class="contenedor">

        <!-- FOTO -->
        <input type="file" ref="inputFoto" accept="image/*" style="display:none" @change="cargarFoto" />

        <div class="foto" @click="abrirArchivos">
          <img v-if="foto" :src="foto" />
          <div v-else class="foto-placeholder">
            <ion-icon :icon="person" class="icono" />
            <span class="texto-foto">AÑADIR<br>IMAGEN</span>
          </div>
        </div>

        <!-- ROL (solo admin editando otro usuario) -->
        <div v-if="esAdmin && editandoOtro" class="selector-rol" @click="toggleRoles">
          <span>{{ rol || 'Seleccionar rol' }}</span>
          <ion-icon :icon="chevronDownOutline" />
        </div>
        <div v-else>
          <p class="etiqueta-rol">{{ rol }}</p>
        </div>

        <!-- CAMPOS -->
        <input class="input" placeholder="Nombre" v-model="nombre" />
        <input class="input" placeholder="Apellido" v-model="apellido" />
        <input class="input" placeholder="Correo" v-model="correo" type="email" />
        <input class="input" placeholder="Teléfono" v-model="telefono" />

        <button class="boton-confirmar" @click="confirmar">Confirmar</button>

        <!-- Eliminar solo si admin edita otro usuario -->
        <button
          v-if="esAdmin && editandoOtro"
          class="boton-eliminar"
          @click="mostrarConfirmarEliminar = true"
        >
          Eliminar Usuario
        </button>

      </div>
    </ion-content>

    <!-- MODAL CONFIRMAR ELIMINACIÓN -->
    <ion-modal :is-open="mostrarConfirmarEliminar" @did-dismiss="mostrarConfirmarEliminar = false" class="modal-centro">
      <div class="modal-contenido">
        <h2 class="modal-titulo">ELIMINAR</h2>
        <p class="modal-subtitulo">¿Seguro que deseas eliminar este usuario?</p>
        <button class="boton-negro" @click="eliminar">Eliminar</button>
        <button class="boton-borde" @click="mostrarConfirmarEliminar = false">Cancelar</button>
      </div>
    </ion-modal>

  </ion-page>
</template>

<script setup>
import {
  IonPage, IonContent, IonIcon, IonModal
} from '@ionic/vue'
import { person, chevronDownOutline } from 'ionicons/icons'
import AppHeader from '@/components/AppHeader.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const nombre = ref('')
const apellido = ref('')
const correo = ref('')
const telefono = ref('')
const rol = ref('')
const foto = ref(null)
const fotoArchivo = ref(null)
const inputFoto = ref(null)
const mostrarConfirmarEliminar = ref(false)

// Datos del usuario logueado
const usuarioLogueado = ref({})
const usuarioAEditar = ref(null)

// Si viene con ?usuario= edita otro; si no, edita su propio perfil
const esAdmin = computed(() => usuarioLogueado.value.rol === 'ADMINISTRADOR')
const editandoOtro = computed(() => !!usuarioAEditar.value)

onMounted(() => {
  const data = localStorage.getItem('usuario')
  if (data) usuarioLogueado.value = JSON.parse(data)

  const usuarioParam = route.query.usuario
  if (usuarioParam) {
    usuarioAEditar.value = JSON.parse(decodeURIComponent(usuarioParam))
    const u = usuarioAEditar.value
    nombre.value = u.nombre
    apellido.value = u.apellido
    correo.value = u.correo
    telefono.value = u.telefono
    rol.value = u.rol
    foto.value = u.foto ? 'http://localhost:3000/' + u.foto : null
  } else {
    const u = usuarioLogueado.value
    nombre.value = u.nombre
    apellido.value = u.apellido
    correo.value = u.correo
    telefono.value = u.telefono
    rol.value = u.rol
    foto.value = u.foto ? 'http://localhost:3000/' + u.foto : null
  }
})

const abrirArchivos = () => inputFoto.value.click()

const cargarFoto = (event) => {
  const file = event.target.files[0]
  if (file) {
    fotoArchivo.value = file
    foto.value = URL.createObjectURL(file)
  }
}

const toggleRoles = () => {
  const roles = ['CAJERO', 'COCINERO', 'ADMINISTRADOR']
  const idx = roles.indexOf(rol.value)
  rol.value = roles[(idx + 1) % roles.length]
}

const confirmar = async () => {
  const id = editandoOtro.value ? usuarioAEditar.value.codigo : usuarioLogueado.value.codigo

  try {
    const body = {
      nombre: nombre.value,
      apellido: apellido.value,
      correo: correo.value,
      telefono: telefono.value,
      rol: rol.value
    }

    const res = await fetch(`http://localhost:3000/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (data.success) {
      if (!editandoOtro.value) {
        localStorage.setItem('usuario', JSON.stringify({ ...usuarioLogueado.value, ...body }))
      }
      alert('Usuario actualizado')
      volver()
    } else {
      alert('Error actualizando usuario')
    }
  } catch (e) {
    console.log(e)
  }
}

const eliminar = async () => {
  const id = usuarioAEditar.value.codigo
  try {
    const res = await fetch(`http://localhost:3000/usuarios/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      alert('Usuario eliminado')
      router.push('/usuarios')
    } else {
      alert('Error eliminando usuario')
    }
  } catch (e) {
    console.log(e)
  }
}

const volver = () => {
  if (editandoOtro.value) router.push('/usuarios')
  else router.push('/tabs/perfil')
}
</script>

<style scoped>
.fondo {
  --background: white;
}

.contenedor {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  padding-bottom: 30px;
}

/* ── Foto ── */
.foto {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden;
  cursor: pointer;
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
}

/* ── Rol ── */
.etiqueta-rol {
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.selector-rol {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 2px solid black;
  border-radius: 20px;
  padding: 6px 16px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
}

/* ── Inputs ── */
.input {
  width: 85%;
  max-width: 340px;
  padding: 10px 0;
  border: none;
  border-bottom: 2px solid black;
  margin-bottom: 20px;
  font-size: 15px;
  background: white;
  color: black;
  outline: none;
}

/* ── Botones ── */
.boton-confirmar {
  width: 85%;
  max-width: 340px;
  padding: 12px;
  border: 2px solid black;
  border-radius: 25px;
  background: white;
  color: black;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 12px;
}

.boton-eliminar {
  width: 85%;
  max-width: 340px;
  padding: 12px;
  border: none;
  border-radius: 25px;
  background: transparent;
  color: #cc0000;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

/* ── Modal ── */
.modal-centro {
  --height: auto;
  --border-radius: 20px;
  --width: 80%;
  --max-width: 320px;
}

.modal-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 24px;
  background: white;
  border-radius: 20px;
  gap: 10px;
}

.modal-titulo {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
}

.modal-subtitulo {
  font-size: 14px;
  color: #555;
  margin: 0 0 10px;
  text-align: center;
}

.boton-negro {
  width: 100%;
  padding: 12px;
  background: black;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
}

.boton-borde {
  width: 100%;
  padding: 12px;
  background: white;
  color: black;
  border: 2px solid black;
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
}
</style>
