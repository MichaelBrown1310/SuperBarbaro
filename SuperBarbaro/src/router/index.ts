import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

import LoginPage from '../views/LoginPage.vue'
import TabsPage from '../views/tabs/TabsPage.vue'

import VentasPage from '../views/ventas/VentasPage.vue'
import InventarioPage from '../views/inventario/InventarioPage.vue'
import ReportesPage from '../views/reportes/ReportesPage.vue'
import PerfilPage from '../views/perfil/PerfilPage.vue'

import UsuariosPage from '../views/usuarios/UsuariosPage.vue'
import RegistrarUsuarioPage from '../views/usuarios/RegistrarUsuarioPage.vue'

const routes: Array<RouteRecordRaw> = [

{
path: '/',
redirect: '/login'
},

{
path: '/login',
component: LoginPage
},

{
path: '/tabs',
component: TabsPage,
children: [

{
path: '',
redirect: '/tabs/ventas'
},

{
path: 'ventas',
component: VentasPage
},

{
path: 'inventario',
component: InventarioPage
},

{
path: 'reportes',
component: ReportesPage
},

{
path: 'perfil',
component: PerfilPage
}

]
},

{
path: '/usuarios',
component: UsuariosPage
},

{
path: '/registrar-usuario',
component: RegistrarUsuarioPage
}

]

const router = createRouter({
history: createWebHistory(import.meta.env.BASE_URL),
routes
})

export default router
