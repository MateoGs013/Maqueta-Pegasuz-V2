import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/eros' },

    // ── Eros panel ──
    {
      path: '/eros',
      component: () => import('@/components/ErosShell.vue'),
      children: [
        { path: '', component: () => import('@/views/Resumen.vue') },
        { path: 'calidad', component: () => import('@/views/Calidad.vue') },
        { path: 'componentes', component: () => import('@/views/Componentes.vue') },
        { path: 'system', component: () => import('@/views/Eros.vue') },
        { path: 'training', component: () => import('@/views/Training.vue') },
      ],
    },

    // ── Workshop panel ──
    {
      path: '/workshop',
      component: () => import('@/components/WorkshopShell.vue'),
      children: [
        { path: '', component: () => import('@/views/workshop/WorkshopHome.vue') },
        { path: 'tokens', component: () => import('@/views/workshop/TokenEditor.vue') },
        { path: 'components', component: () => import('@/views/workshop/ComponentEditor.vue') },
      ],
    },
  ],
})
