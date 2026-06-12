import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './shared/presentation/views/Login.vue'
import DashboardView from './shared/presentation/views/Dashboard.vue'
import AdminDashboardView from './shared/presentation/views/AdminDashboard.vue'
import SimulationFormView from './shared/presentation/views/SimulationForm.vue'
import ResultsView from './shared/presentation/views/Results.vue'
import ClientsView from './shared/presentation/views/Clients.vue'
import VehiclesView from './shared/presentation/views/Vehicles.vue'
import PageNotFoundView from './shared/presentation/views/page-not-found.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/admin', name: 'admin', component: AdminDashboardView },
    { path: '/simulate', name: 'simulate', component: SimulationFormView },
    { path: '/results', name: 'results', component: ResultsView },
    { path: '/clients', name: 'clients', component: ClientsView },
    { path: '/vehicles', name: 'vehicles', component: VehiclesView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFoundView }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// Simple route guard
router.beforeEach((to, from, next) => {
    const role = localStorage.getItem('role');
    if (to.name !== 'login' && !role) next({ name: 'login' });
    else if (to.name === 'admin' && role !== 'admin') next({ name: 'dashboard' });
    else if ((to.name === 'dashboard' || to.name === 'simulate') && role === 'admin') next({ name: 'admin' });
    else next();
})

export default router