<template>
  <div class="dashboard">
    <header class="glass-panel header">
      <h2>Panel Administrativo AutoTech</h2>
      <button class="btn-primary" @click="logout">Salir</button>
    </header>

    <div class="metrics grid">
      <div class="glass-panel indicator">
        <p>Créditos Otorgados</p>
        <h3>{{ metrics.total_otorgados }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>Monto Financiado Total</p>
        <h3 class="highlight">${{ Number(metrics.monto_total_financiado).toFixed(2) }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>TCEA Promedio</p>
        <h3 class="highlight-purple">{{ Number(metrics.tcea_promedio).toFixed(2) }}%</h3>
      </div>
    </div>

    <div class="content">
      <div class="glass-panel card table-container">
        <h3>Historial Global de Créditos Otorgados</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Monto</th>
              <th>Asesor</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in history" :key="c.id">
              <td>{{ c.id }}</td>
              <td>{{ c.Cliente?.nombre }}</td>
              <td>{{ c.Vehiculo?.marca }} {{ c.Vehiculo?.modelo }}</td>
              <td>${{ Number(c.monto_financiado).toFixed(2) }}</td>
              <td>{{ c.Usuario?.nombre }}</td>
              <td>{{ new Date(c.createdAt).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="glass-panel card">
        <h3>Gestión de Usuarios</h3>
        <form @submit.prevent="createUser" class="user-form">
          <input type="text" v-model="newUser.username" placeholder="Nombre de usuario" required />
          <input type="password" v-model="newUser.password" placeholder="Contraseña" required />
          <select v-model="newUser.rol">
            <option value="user">Asesor (User)</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="submit" class="btn-primary">Crear Usuario</button>
        </form>

        <table class="mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td>{{ u.nombre }}</td>
              <td>{{ u.rol }}</td>
              <td>
                <button v-if="u.nombre !== 'admin'" class="btn-secondary danger" @click="deleteUser(u.id)">Eliminar</button>
              </td>
            </tr>
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
const metrics = ref({ total_otorgados: 0, monto_total_financiado: 0, tcea_promedio: 0 });
const history = ref([]);
const users = ref([]);

const newUser = ref({ username: '', password: '', rol: 'user' });

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

const fetchData = async () => {
  const headers = { userid: localStorage.getItem('userid'), role: localStorage.getItem('role') };
  
  const mRes = await axios.get('http://localhost:3000/api/credit/metrics', { headers });
  metrics.value = mRes.data.data;

  const hRes = await axios.get('http://localhost:3000/api/credit/history', { headers });
  // Filtrar solo los otorgados para el admin
  history.value = hRes.data.data.filter(c => c.estado === 'Otorgado');

  const uRes = await axios.get('http://localhost:3000/api/users', { headers });
  users.value = uRes.data.data;
};

const createUser = async () => {
  await axios.post('http://localhost:3000/api/users', newUser.value);
  newUser.value = { username: '', password: '', rol: 'user' };
  fetchData();
};

const deleteUser = async (id) => {
  await axios.delete(`http://localhost:3000/api/users/${id}`);
  fetchData();
};

onMounted(fetchData);
</script>

<style scoped>
.dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 2rem; }
.content { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.card { padding: 2rem; }
.card h3 { color: var(--accent-blue); margin-bottom: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.indicator { text-align: center; padding: 1.5rem; }
.indicator p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }
.indicator h3 { font-size: 1.8rem; }
.highlight { color: var(--accent-cyan); }
.highlight-purple { color: #b14eff; }
.table-container { overflow-x: auto; }
.user-form { display: flex; flex-direction: column; gap: 0.5rem; }
.user-form input, .user-form select { margin: 0; }
.mt-4 { margin-top: 1rem; }
.danger { color: #ff4d4f; border-color: #ff4d4f; }
.btn-secondary { background: transparent; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; border: 1px solid var(--glass-border); color: white; }
</style>
