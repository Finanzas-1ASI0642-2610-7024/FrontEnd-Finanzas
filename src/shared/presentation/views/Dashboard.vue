<template>
  <div class="dashboard">
    <header class="glass-panel header">
      <h2><i class="fas fa-chart-line"></i> Panel del Asesor</h2>
      <div class="actions">
        <button class="btn-primary mr" @click="$router.push('/simulate')">
          <i class="fas fa-plus"></i> Nueva Simulación
        </button>
        <button class="btn-secondary mr" @click="$router.push('/clients')">
          <i class="fas fa-users"></i> Clientes
        </button>
        <button class="btn-secondary mr" @click="$router.push('/vehicles')">
          <i class="fas fa-car"></i> Vehículos
        </button>
        <button class="btn-secondary" @click="logout" title="Cerrar Sesión">
          <i class="fas fa-sign-out-alt"></i> Salir
        </button>
      </div>
    </header>

    <div class="content full-width">
      <!-- Tarjetas de KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <i class="fas fa-file-invoice-dollar kpi-icon text-cyan"></i>
          <h4>Simulaciones Activas</h4>
          <span class="kpi-value">{{ totalSimulaciones }}</span>
        </div>
        <div class="kpi-card primary-card">
          <i class="fas fa-check-circle kpi-icon text-green"></i>
          <h4>Créditos Otorgados</h4>
          <span class="kpi-value">{{ totalOtorgados }}</span>
        </div>
        <div class="kpi-card purple-card">
          <i class="fas fa-money-bill-wave kpi-icon text-purple"></i>
          <h4>Capital Colocado (Aprox S/)</h4>
          <span class="kpi-value">S/{{ formatMoney(montoTotalOtorgado) }}</span>
        </div>
        <div class="kpi-card">
          <i class="fas fa-percentage kpi-icon text-orange"></i>
          <h4>Tasa de Conversión</h4>
          <span class="kpi-value">{{ conversionRate }}%</span>
        </div>
      </div>

      <!-- Buscador -->
      <div class="search-bar-container">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por nombre de cliente o DNI..." 
            class="search-input"
          />
        </div>
      </div>

      <!-- Tabla de Simulaciones -->
      <div class="glass-panel card table-container">
        <h3><i class="fas fa-hourglass-half"></i> Simulaciones Activas</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Vehículo</th>
              <th>Monto Financiado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredSimulaciones" :key="c.id">
              <td>{{ formatDate(c.createdAt) }}</td>
              <td>{{ c.Cliente?.nombre }} {{ c.Cliente?.apellido }}</td>
              <td>{{ c.Cliente?.dni }}</td>
              <td>{{ c.Vehiculo?.marca }} {{ c.Vehiculo?.modelo }}</td>
              <td>{{ c.tipo_moneda === 'USD' ? '$' : 'S/' }}{{ formatMoney(c.monto_financiado) }}</td>
              <td><span class="badge badge-warning">Simulado</span></td>
              <td class="action-buttons">
                <button class="icon-btn" title="Ver Detalles" @click="verDetalle(c.id)"><i class="fas fa-eye"></i></button>
                <button class="icon-btn" title="Editar Simulación" @click="editar(c.id)"><i class="fas fa-edit"></i></button>
                <button class="icon-btn" title="Exportar a Excel" @click="descargarExcel(c.id)"><i class="fas fa-file-excel"></i></button>
                <button class="icon-btn btn-success" title="Otorgar Crédito" @click="otorgar(c.id)"><i class="fas fa-check"></i></button>
              </td>
            </tr>
            <tr v-if="filteredSimulaciones.length === 0">
              <td colspan="7" class="text-center py-4">
                <span v-if="searchQuery">No se encontraron resultados para "{{ searchQuery }}".</span>
                <span v-else>No hay simulaciones pendientes.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabla de Créditos Otorgados -->
      <div class="glass-panel card table-container mt-4">
        <h3><i class="fas fa-award"></i> Historial de Créditos Otorgados</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha Otorgado</th>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Vehículo</th>
              <th>Monto Financiado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredOtorgados" :key="c.id">
              <td>{{ formatDate(c.updatedAt) }}</td>
              <td>{{ c.Cliente?.nombre }} {{ c.Cliente?.apellido }}</td>
              <td>{{ c.Cliente?.dni }}</td>
              <td>{{ c.Vehiculo?.marca }} {{ c.Vehiculo?.modelo }}</td>
              <td>{{ c.tipo_moneda === 'USD' ? '$' : 'S/' }}{{ formatMoney(c.monto_financiado) }}</td>
              <td><span class="badge badge-success">Otorgado</span></td>
              <td class="action-buttons">
                <button class="icon-btn" title="Ver Detalles" @click="verDetalle(c.id)"><i class="fas fa-eye"></i></button>
                <button class="icon-btn" title="Exportar a Excel" @click="descargarExcel(c.id)"><i class="fas fa-file-excel"></i></button>
              </td>
            </tr>
            <tr v-if="filteredOtorgados.length === 0">
              <td colspan="7" class="text-center py-4">
                <span v-if="searchQuery">No se encontraron resultados para "{{ searchQuery }}".</span>
                <span v-else>No has otorgado créditos aún.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const simulaciones = ref([]);
const otorgados = ref([]);
const searchQuery = ref('');

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

const fetchData = async () => {
  try {
    const headers = { userid: localStorage.getItem('userid'), role: localStorage.getItem('role') };
    const res = await axios.get('http://localhost:3000/api/credit/history', { headers });
    
    simulaciones.value = res.data.data.filter(c => c.estado === 'Simulado');
    otorgados.value = res.data.data.filter(c => c.estado === 'Otorgado');
  } catch (error) {
    console.error("Error cargando historial", error);
  }
};

// Computed Properties para KPIs
const totalSimulaciones = computed(() => simulaciones.value.length);
const totalOtorgados = computed(() => otorgados.value.length);
const montoTotalOtorgado = computed(() => {
  return otorgados.value.reduce((sum, c) => {
    const monto = Number(c.monto_financiado) || 0;
    const tc = Number(c.tipo_cambio) || 1;
    // Si es Dólar, lo pasamos a Soles referencialmente para el KPI
    const montoEnSoles = c.tipo_moneda === 'USD' ? monto * tc : monto;
    return sum + montoEnSoles;
  }, 0);
});
const conversionRate = computed(() => {
  const total = totalSimulaciones.value + totalOtorgados.value;
  if(total === 0) return 0;
  return ((totalOtorgados.value / total) * 100).toFixed(1);
});

// Filtros de Búsqueda
const filterList = (list) => {
  const term = searchQuery.value.toLowerCase().trim();
  if (!term) return list;
  return list.filter(c => {
    const nombre = (c.Cliente?.nombre || '').toLowerCase();
    const apellido = (c.Cliente?.apellido || '').toLowerCase();
    const dni = (c.Cliente?.dni || '').toLowerCase();
    return nombre.includes(term) || apellido.includes(term) || dni.includes(term);
  });
};

const filteredSimulaciones = computed(() => filterList(simulaciones.value));
const filteredOtorgados = computed(() => filterList(otorgados.value));

// Acciones de la tabla
const verDetalle = (id) => router.push(`/results?id=${id}`);
const editar = (id) => router.push(`/simulate?id=${id}`);
const otorgar = async (id) => {
  if (confirm('¿Estás seguro de otorgar este crédito? Esto lo moverá al historial definitivo.')) {
    try {
      await axios.post(`http://localhost:3000/api/credit/${id}/otorgar`);
      fetchData();
    } catch (e) {
      alert("Error al otorgar el crédito.");
    }
  }
};
const descargarExcel = (id) => {
  window.open(`http://localhost:3000/api/credit/${id}/excel`, '_blank');
};

// Utilidades
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-PE', options);
};

const formatMoney = (num) => Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

onMounted(fetchData);
</script>

<style scoped>
.dashboard { padding: 2rem; max-width: 1400px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 2rem; }
.content { display: flex; flex-direction: column; gap: 2rem; }

/* Tarjetas KPI */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1rem; }
.kpi-card { background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; transition: transform 0.3s ease; }
.kpi-card:hover { transform: translateY(-5px); }
.kpi-icon { font-size: 2rem; margin-bottom: 1rem; opacity: 0.9; }
.kpi-card h4 { color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
.kpi-value { font-size: 1.8rem; font-weight: bold; color: white; }
.text-cyan { color: var(--accent-cyan); }
.text-green { color: #52c41a; }
.text-purple { color: #b14eff; }
.text-orange { color: #fa8c16; }

/* Buscador */
.search-bar-container { display: flex; justify-content: flex-end; margin-bottom: 1rem; }
.search-input-wrapper { position: relative; width: 100%; max-width: 400px; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
.search-input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.5rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px; color: white; font-size: 1rem; transition: border-color 0.3s; }
.search-input:focus { outline: none; border-color: var(--accent-cyan); }

/* Tablas */
.card { padding: 2rem; }
.card h3 { color: var(--accent-blue); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
.table-container { overflow-x: auto; width: 100%; }
.table-container table { width: 100%; white-space: nowrap; border-collapse: separate; border-spacing: 0 8px; }
.table-container th { background: transparent; padding: 1rem; color: var(--text-secondary); text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
.table-container td { padding: 1rem; background: rgba(255,255,255,0.02); }
.table-container tr:hover td { background: rgba(255,255,255,0.05); }
.text-center { text-align: center; }
.py-4 { padding-top: 2rem !important; padding-bottom: 2rem !important; }

/* Badges */
.badge { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
.badge-warning { background: rgba(250, 140, 22, 0.2); color: #fa8c16; border: 1px solid rgba(250, 140, 22, 0.5); }
.badge-success { background: rgba(82, 196, 26, 0.2); color: #52c41a; border: 1px solid rgba(82, 196, 26, 0.5); }

/* Botones y Acciones */
.mr { margin-right: 1rem; }
.mt-4 { margin-top: 2rem; }
.action-buttons { display: flex; gap: 0.5rem; }
.icon-btn { background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border); width: 35px; height: 35px; border-radius: 6px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.2s; }
.icon-btn:hover { background: rgba(255,255,255,0.1); color: white; transform: translateY(-2px); }
.icon-btn.btn-success { border-color: rgba(82, 196, 26, 0.5); color: #52c41a; }
.icon-btn.btn-success:hover { background: #52c41a; color: white; }
.btn-secondary { background: transparent; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; border: 1px solid var(--glass-border); color: white; display: inline-flex; align-items: center; gap: 0.5rem; transition: background 0.3s; }
.btn-secondary:hover { background: rgba(255,255,255,0.1); }
.btn-primary { background: var(--accent-blue); padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; border: none; color: white; display: inline-flex; align-items: center; gap: 0.5rem; transition: filter 0.3s; }
.btn-primary:hover { filter: brightness(1.2); }
</style>
