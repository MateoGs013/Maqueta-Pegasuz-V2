import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Runs.vue'),
    },
    {
      path: '/blueprints',
      component: () => import('@/views/Blueprints.vue'),
    },
    {
      path: '/design-dna',
      component: () => import('@/views/DesignDNA.vue'),
    },
    {
      path: '/observer',
      component: () => import('@/views/Observer.vue'),
    },
    {
      path: '/visual-debt',
      component: () => import('@/views/VisualDebt.vue'),
    },
    {
      path: '/decisions',
      component: () => import('@/views/Decisions.vue'),
    },
  ],
})
