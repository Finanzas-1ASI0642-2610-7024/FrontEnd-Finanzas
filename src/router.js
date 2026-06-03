import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './shared/presentation/views/Login.vue'
import DashboardView from './shared/presentation/views/Dashboard.vue'
import SimulationFormView from './shared/presentation/views/SimulationForm.vue'
import ResultsView from './shared/presentation/views/Results.vue'
import PageNotFoundView from './shared/presentation/views/page-not-found.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/simulate', name: 'simulate', component: SimulationFormView },
    { path: '/results', name: 'results', component: ResultsView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFoundView }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router