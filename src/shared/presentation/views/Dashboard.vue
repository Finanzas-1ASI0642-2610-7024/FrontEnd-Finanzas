<template>
  <div class="dashboard">
    <header class="glass-panel header">
      <h2>Panel del Asesor</h2>
      <div class="actions">
        <button class="btn-primary mr" @click="$router.push('/simulate')">Nueva Simulación</button>
        <button class="btn-secondary" @click="logout">Salir</button>
      </div>
    </header>

    <div class="content full-width">
      <div class="glass-panel card table-container">
        <h3>Mis Simulaciones</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Monto Financiado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in simulaciones" :key="c.id">
              <td>{{ c.id }}</td>
              <td>{{ c.Cliente?.nombre }}</td>
              <td>{{ c.Vehiculo?.marca }} {{ c.Vehiculo?.modelo }}</td>
              <td>${{ Number(c.monto_financiado).toFixed(2) }}</td>
              <td class="action-buttons">
                <button class="btn-sm" @click="verDetalle(c.id)">Ver</button>
                <button class="btn-sm" @click="editar(c.id)">Editar</button>
                <button class="btn-sm" @click="descargarExcel(c.id)">Excel</button>
                <button class="btn-sm btn-success" @click="otorgar(c.id)">Otorgar</button>
              </td>
            </tr>
            <tr v-if="simulaciones.length === 0"><td colspan="5">No hay simulaciones pendientes.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="glass-panel card table-container mt-4">
        <h3>Mis Créditos Otorgados</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Monto Financiado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in otorgados" :key="c.id">
              <td>{{ c.id }}</td>
              <td>{{ c.Cliente?.nombre }}</td>
              <td>{{ c.Vehiculo?.marca }} {{ c.Vehiculo?.modelo }}</td>
              <td>${{ Number(c.monto_financiado).toFixed(2) }}</td>
              <td class="action-buttons">
                <button class="btn-sm" @click="verDetalle(c.id)">Ver</button>
                <button class="btn-sm" @click="descargarExcel(c.id)">Excel</button>
              </td>
            </tr>
            <tr v-if="otorgados.length === 0"><td colspan="5">No has otorgado créditos aún.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const simulaciones = ref([]);
const otorgados = ref([]);

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

const fetchData = async () => {
  const headers = { userid: localStorage.getItem('userid'), role: localStorage.getItem('role') };
  const res = await axios.get('http://localhost:3000/api/credit/history', { headers });
  
  simulaciones.value = res.data.data.filter(c => c.estado === 'Simulacion');
  otorgados.value = res.data.data.filter(c => c.estado === 'Otorgado');
};

const verDetalle = (id) => {
  router.push(`/results?id=${id}`);
};

const editar = (id) => {
  router.push(`/simulate?id=${id}`);
};

const otorgar = async (id) => {
  await axios.post(`http://localhost:3000/api/credit/${id}/otorgar`);
  fetchData();
};

const descargarExcel = (id) => {
  window.open(`http://localhost:3000/api/credit/${id}/excel`, '_blank');
};

onMounted(fetchData);
</script>

<style scoped>
.dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 2rem; }
.content { display: flex; flex-direction: column; gap: 2rem; }
.card { padding: 2rem; }
.card h3 { color: var(--accent-blue); margin-bottom: 1rem; }
.mr { margin-right: 1rem; }
.mt-4 { margin-top: 2rem; }
.action-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn-sm { background: var(--glass-bg); color: white; border: 1px solid var(--glass-border); padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; }
.btn-sm:hover { background: rgba(255,255,255,0.1); }
.btn-success { border-color: #52c41a; color: #52c41a; }
.btn-success:hover { background: rgba(82, 196, 26, 0.1); }
.btn-secondary { background: transparent; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; border: 1px solid var(--glass-border); color: white; }
</style>
