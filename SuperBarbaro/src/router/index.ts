import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

import LoginPage from '../views/LoginPage.vue'
import TabsPage from '../views/tabs/TabsPage.vue'

import VentasPage from '../views/ventas/VentasPage.vue'

import ReportesPage from '../views/reportes/ReportesPage.vue'

import PerfilPage from '../views/perfil/PerfilPage.vue'

import UsuariosPage from '../views/usuarios/UsuariosPage.vue'
import RegistrarUsuarioPage from '../views/usuarios/RegistrarUsuarioPage.vue'
import NuevaOrdenPage from '@/views/Ventas/NuevaOrdenPage.vue'

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

      // INVENTARIO VISTAS

      {
        path: 'inventario',
        component: () => import('@/views/inventario/InventarioPage.vue')
      },
      {
        path: 'productos/:categoria',
        component: () => import('@/views/inventario/ProductosPage.vue')
      },
      {
        path: 'producto/:id',
        component: () => import('@/views/inventario/ProductoDetallePage.vue')
      },
      {
        path: 'nuevo-producto',
        component: () => import('@/views/inventario/NuevoProductoPage.vue')
      },
      {
        path: 'editar-producto/:id',
        component: () => import('@/views/inventario/EditarProductoPage.vue')
      },
      {
        path: 'nueva-categoria',
        component: () => import('@/views/inventario/NuevaCategoriaPage.vue')
      },
      {
        path: 'nuevo-producto/:categoria',
        component: () => import('@/views/inventario/NuevoProductoPage.vue')
      },
      {
        path: 'menu',
        component: () => import('@/views/inventario/MenuPage.vue')
      },

      //REPORTES
      {
        path: 'reportes',
        component: ReportesPage
      },

      {
        path: 'reportes/ventas-diarias',
        component: () => import('@/views/Reportes/VentasDiariasPage.vue')
      },

      {
        path: 'reportes/estimaciones',
        component: () => import('@/views/Reportes/EstimacionesPage.vue')
      },
      
      //PERFIL
      {
        path: 'perfil',
        component: PerfilPage
      },

      { 
        path: '/editar-perfil', 
        component: () => import('@/views/perfil/EditarUsuarioPage.vue') 
      },
      
      { 
        path: '/editar-usuario', 
        component: () => import('@/views/usuarios/EditarUsuarioPage.vue')
      },

    ]
  },

  {
    path: '/usuarios',
    component: UsuariosPage
  },

  {
    path: '/registrar-usuario',
    component: RegistrarUsuarioPage
  },

  {
    path: '/nueva-orden',
    component: NuevaOrdenPage
  }


]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
