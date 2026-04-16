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
import ListaPedidoPage from '@/views/Ventas/ListaPedidoPage.vue'
import DetallePedidoPage from '@/views/Ventas/DetallePedidoPage.vue'

const routes: Array<RouteRecordRaw> = [

  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: LoginPage,
    meta: {
      guestOnly: true
    }
  },

  {
    path: '/tabs',
    component: TabsPage,
    meta: {
      requiresAuth: true
    },
    children: [

      {
        path: '',
        redirect: '/tabs/ventas'
      },

      {
        path: 'ventas',
        component: VentasPage
      },
      

      // INVENTARIO VISTAS CON MENU INFERIOR

      {
        path: 'inventario',
        component: () => import('@/views/inventario/InventarioPage.vue')
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

      // PERFIL

      {
        path: 'perfil',
        component: PerfilPage
      },

      { 
        path: '/editar-perfil', 
        component: () => import('@/views/perfil/EditarUsuarioPage.vue') 
      },
      
    ]
  },

  {
    path: '/usuarios',
    component: UsuariosPage,
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMINISTRADOR']
    }
  },
  // INVENTARIO VISTAS
  {
    path: '/productos/:categoria',
    component: () => import('@/views/inventario/ProductosPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/producto/:id',
    component: () => import('@/views/inventario/ProductoDetallePage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/nuevo-producto',
    component: () => import('@/views/inventario/NuevoProductoPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/editar-producto/:id',
    component: () => import('@/views/inventario/EditarProductoPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/nueva-categoria',
    component: () => import('@/views/inventario/NuevaCategoriaPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/nuevo-producto/:categoria',
    component: () => import('@/views/inventario/NuevoProductoPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/menu',
    component: () => import('@/views/inventario/MenuPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  
  //USUARIO VISTAS PEDIDOS

  {
    path: '/registrar-usuario',
    component: RegistrarUsuarioPage,
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMINISTRADOR']
    }
  },

  {
    path: '/nueva-orden',
    component: NuevaOrdenPage,
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMINISTRADOR', 'CAJERO']
    }
  },

  {
    path: '/lista-pedidos',
    component: ListaPedidoPage,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/detalle-pedido/:id',
    component: DetallePedidoPage,
    meta: {
      requiresAuth: true
    }
  },
  {
  path: '/historial-ventas',
  component: () => import('@/views/Ventas/HistorialVentasPage.vue'),
  meta: {
    requiresAuth: true
  }
  },
  {
  path: '/pedidos-hoy',
  component: () => import('@/views/ventas/PedidosHoyPage.vue'),
  meta: {
    requiresAuth: true
  }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const usuarioGuardado = localStorage.getItem('usuario')
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null
  const rolUsuario = (usuario?.rol || '').toString().trim().toUpperCase()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth) || to.path !== '/login'
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)
  const rolesPermitidos = [...to.matched]
    .reverse()
    .find((record) => Array.isArray(record.meta.allowedRoles))
    ?.meta.allowedRoles as string[] | undefined

  if (requiresAuth && !usuario) {
    return '/login'
  }

  if (guestOnly && usuario) {
    return '/tabs/ventas'
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rolUsuario)) {
    return '/tabs/ventas'
  }

  return true
})

export default router
