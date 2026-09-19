import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import CreateEvent from '@/views/CreateEvent.vue'
import Preview from '@/views/Preview.vue'
import EventPage from '@/views/Event.vue'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/create', name: 'CreateEvent', component: CreateEvent },
    { path: '/preview', name: 'Preview', component: Preview },
    { path: '/event/:id', name: 'EventPage', component: EventPage, props: true },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  ],
})

export default router
