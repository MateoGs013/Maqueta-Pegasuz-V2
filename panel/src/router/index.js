import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/projects' },

    // ── Main shell (sidebar: Projects / Eros / Workshop) ──
    {
      path: '/',
      component: () => import('@/components/MainShell.vue'),
      children: [
        // Projects list
        { path: 'projects', component: () => import('@/views/projects/ProjectList.vue') },

        // Eros brain
        { path: 'eros', component: () => import('@/views/eros/ErosBrain.vue') },
        { path: 'eros/chat', component: () => import('@/views/eros/ErosChat.vue') },
        { path: 'eros/training', component: () => import('@/views/Training.vue') },

        // Workshop
        { path: 'workshop', component: () => import('@/views/workshop/WorkshopHome.vue') },
        { path: 'workshop/tokens', component: () => import('@/views/workshop/TokenEditor.vue') },
        { path: 'workshop/components', component: () => import('@/views/workshop/ComponentEditor.vue') },
      ],
    },

    // ── Per-project shell (header: Resumen / Calidad / Observer) ──
    {
      path: '/projects/:slug',
      component: () => import('@/views/projects/ProjectShell.vue'),
      children: [
        { path: '', component: () => import('@/views/projects/ProjectResumen.vue') },
        { path: 'calidad', component: () => import('@/views/projects/ProjectCalidad.vue') },
      ],
    },
  ],
})
