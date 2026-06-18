<template>
  <div class="dashboard">
    <header class="glass-panel header">
      <h2><i class="fas fa-user-shield"></i> Panel Administrativo AutoTech</h2>
      <button class="btn-secondary" @click="logout" title="Cerrar Sesión">
        <i class="fas fa-sign-out-alt"></i> Salir
      </button>
    </header>

    <!-- Tarjetas de KPI -->
    <div class="kpi-grid">
      <div class="kpi-card primary-card">
        <i class="fas fa-check-double kpi-icon text-green"></i>
        <h4>Créditos Otorgados</h4>
        <span class="kpi-value">{{ metrics.total_otorgados }}</span>
      </div>
      <div class="kpi-card">
        <i class="fas fa-chart-line kpi-icon text-cyan"></i>
        <h4>Monto Financiado Total</h4>
        <span class="kpi-value">S/{{ formatMoney(metrics.monto_total_financiado) }}</span>
      </div>
      <div class="kpi-card purple-card">
        <i class="fas fa-percentage kpi-icon text-purple"></i>
        <h4>TCEA Promedio</h4>
        <span class="kpi-value">{{ formatMoney(metrics.tcea_promedio) }}%</span>
      </div>
    </div>

    <div class="content">
      <!-- Sección Historial Global -->
      <div class="glass-panel card table-container history-section">
        <div class="card-header-flex">
          <h3><i class="fas fa-globe"></i> Historial Global de Créditos</h3>
          
          <!-- Buscador -->
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar cliente, DNI o asesor..." 
              class="search-input"
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Vehículo</th>
              <th>Monto</th>
              <th>Asesor a cargo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredHistory" :key="c.id">
              <td><strong>#{{ c.id }}</strong></td>
              <td>{{ formatDate(c.createdAt) }}</td>
              <td>{{ c.Cliente?.nombre }} {{ c.Cliente?.apellido }}</td>
              <td>{{ c.Cliente?.dni }}</td>
              <td>{{ c.Vehiculo?.marca }} {{ c.Vehiculo?.modelo }}</td>
              <td>{{ c.tipo_moneda === 'USD' ? '$' : 'S/' }}{{ formatMoney(c.monto_financiado) }}</td>
              <td><span class="badge badge-asesor"><i class="fas fa-user-tie"></i> {{ c.Usuario?.nombre }}</span></td>
            </tr>
            <tr v-if="filteredHistory.length === 0">
              <td colspan="7" class="text-center py-4">
                <span v-if="searchQuery">No se encontraron resultados para "{{ searchQuery }}".</span>
                <span v-else>No hay historial de créditos otorgados.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sección de Usuarios -->
      <div class="users-section">
        <!-- Formulario Crear Usuario -->
        <div class="glass-panel card mb-4">
          <h3><i class="fas fa-user-plus"></i> Crear Nuevo Acceso</h3>
          <form @submit.prevent="createUser" class="user-form">
            <div class="input-group">
              <label>Usuario</label>
              <input type="text" v-model="newUser.username" placeholder="johndoe" required />
            </div>
            <div class="input-group">
              <label>Contraseña</label>
              <input type="password" v-model="newUser.password" placeholder="••••••••" required />
            </div>
            <div class="input-group">
              <label>Rol de Sistema</label>
              <select v-model="newUser.rol">
                <option value="user">Asesor Comercial</option>
                <option value="admin">Administrador (Auditor)</option>
              </select>
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 1rem;">
              <i class="fas fa-save"></i> Registrar
            </button>
          </form>
        </div>

        <!-- Tabla Usuarios -->
        <div class="glass-panel card table-container">
          <h3><i class="fas fa-users-cog"></i> Gestión de Usuarios</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.id }}</td>
                <td><strong>{{ u.nombre }}</strong></td>
                <td>
                  <span class="badge" :class="u.rol === 'admin' ? 'badge-admin' : 'badge-user'">
                    {{ u.rol === 'admin' ? 'Administrador' : 'Asesor' }}
                  </span>
                </td>
                <td class="text-center">
                  <button v-if="u.nombre !== 'admin'" class="icon-btn danger" title="Eliminar Acceso" @click="deleteUser(u.id)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const metrics = ref({ total_otorgados: 0, monto_total_financiado: 0, tcea_promedio: 0 });
const history = ref([]);
const users = ref([]);
const searchQuery = ref('');

const newUser = ref({ username: '', password: '', rol: 'user' });

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

const fetchData = async () => {
  try {
    const headers = { userid: localStorage.getItem('userid'), role: localStorage.getItem('role') };
    
    const mRes = await axios.get('http://localhost:3000/api/credit/metrics', { headers });
    metrics.value = mRes.data.data;

    const hRes = await axios.get('http://localhost:3000/api/credit/history', { headers });
    history.value = hRes.data.data.filter(c => c.estado === 'Otorgado');

    const uRes = await axios.get('http://localhost:3000/api/users', { headers });
    users.value = uRes.data.data;
  } catch (error) {
    console.error("Error al cargar la data", error);
  }
};

const createUser = async () => {
  try {
    await axios.post('http://localhost:3000/api/users', newUser.value);
    newUser.value = { username: '', password: '', rol: 'user' };
    fetchData();
  } catch (error) {
    alert("Error al crear usuario.");
  }
};

const deleteUser = async (id) => {
  if (confirm("¿Estás seguro de eliminar este usuario? Esto revocará permanentemente su acceso al sistema.")) {
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      fetchData();
    } catch (error) {
      alert("Error al eliminar usuario.");
    }
  }
};

// Computed property para filtrar historial global
const filteredHistory = computed(() => {
  const term = searchQuery.value.toLowerCase().trim();
  if (!term) return history.value;
  
  return history.value.filter(c => {
    const nombre = (c.Cliente?.nombre || '').toLowerCase();
    const apellido = (c.Cliente?.apellido || '').toLowerCase();
    const dni = (c.Cliente?.dni || '').toLowerCase();
    const asesor = (c.Usuario?.nombre || '').toLowerCase();
    return nombre.includes(term) || apellido.includes(term) || dni.includes(term) || asesor.includes(term);
  });
});

// Utilidades
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-PE', options);
};

const formatMoney = (num) => Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

onMounted(fetchData);
</script>

<style scoped>
.dashboard { padding: 2rem; max-width: 1500px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 2rem; }
.content { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }

/* Tarjetas KPI */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.kpi-card { background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; transition: transform 0.3s ease; }
.kpi-card:hover { transform: translateY(-5px); }
.kpi-icon { font-size: 2.2rem; margin-bottom: 1rem; opacity: 0.9; }
.kpi-card h4 { color: var(--text-secondary); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
.kpi-value { font-size: 2rem; font-weight: bold; color: white; }
.text-cyan { color: var(--accent-cyan); }
.text-green { color: #52c41a; }
.text-purple { color: #b14eff; }

/* Buscador */
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.search-input-wrapper { position: relative; width: 100%; max-width: 350px; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
.search-input { margin: 0; width: 100%; padding: 0.7rem 1rem 0.7rem 2.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; color: white; font-size: 0.9rem; transition: border-color 0.3s; }
.search-input:focus { outline: none; border-color: var(--accent-cyan); }

/* Tablas */
.card { padding: 2rem; }
.card h3 { color: var(--accent-blue); margin: 0; display: flex; align-items: center; gap: 0.5rem; }
.table-container { overflow-x: auto; width: 100%; }
.table-container table { width: 100%; white-space: nowrap; border-collapse: separate; border-spacing: 0 8px; }
.table-container th { background: transparent; padding: 1rem; color: var(--text-secondary); text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
.table-container td { padding: 1rem; background: rgba(255,255,255,0.02); }
.table-container tr:hover td { background: rgba(255,255,255,0.05); }
.text-center { text-align: center; }
.py-4 { padding-top: 2rem !important; padding-bottom: 2rem !important; }

/* Formularios */
.user-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
.input-group { display: flex; flex-direction: column; gap: 0.4rem; }
.input-group label { font-size: 0.85rem; color: var(--text-secondary); }
.input-group input, .input-group select { padding: 0.8rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; color: white; width: 100%; box-sizing: border-box; }

/* Badges */
.badge { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.badge-admin { background: rgba(177, 78, 255, 0.2); color: #b14eff; border: 1px solid rgba(177, 78, 255, 0.5); }
.badge-user { background: rgba(255, 255, 255, 0.1); color: var(--text-secondary); border: 1px solid var(--glass-border); }
.badge-asesor { background: rgba(0, 229, 255, 0.1); color: var(--accent-cyan); border: 1px solid rgba(0, 229, 255, 0.3); display: inline-flex; align-items: center; gap: 0.4rem; }

/* Botones */
.mb-4 { margin-bottom: 2rem; }
.icon-btn { background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border); width: 35px; height: 35px; border-radius: 6px; cursor: pointer; display: inline-flex; justify-content: center; align-items: center; transition: all 0.2s; }
.icon-btn:hover { background: rgba(255,255,255,0.1); color: white; transform: translateY(-2px); }
.icon-btn.danger { color: #ff4d4f; border-color: rgba(255, 77, 79, 0.3); }
.icon-btn.danger:hover { background: #ff4d4f; color: white; border-color: #ff4d4f; }
.btn-primary { background: var(--accent-blue); padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; border: none; color: white; font-weight: bold; transition: filter 0.3s; }
.btn-primary:hover { filter: brightness(1.2); }
.btn-secondary { background: transparent; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; border: 1px solid var(--glass-border); color: white; display: inline-flex; align-items: center; gap: 0.5rem; transition: background 0.3s; }
.btn-secondary:hover { background: rgba(255,255,255,0.1); }

/* Responsive Grid */
@media (max-width: 1024px) {
  .content { grid-template-columns: 1fr; }
}
</style>
