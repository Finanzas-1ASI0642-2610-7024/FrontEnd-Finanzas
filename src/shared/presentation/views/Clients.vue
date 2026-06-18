<template>
  <div class="clients-page">
    <div class="header-actions">
      <div>
        <button class="btn-secondary" @click="$router.push('/dashboard')" style="margin-right: 1rem;">← Volver</button>
        <h2 style="display: inline-block;">Directorio de Clientes</h2>
      </div>
      <button class="btn-primary" @click="openModal()">+ Nuevo Cliente</button>
    </div>

    <div class="glass-panel table-container">
      <table>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre Completo</th>
            <th>Celular</th>
            <th>Dirección</th>
            <th>Edad</th>
            <th>Ingreso Mensual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clients" :key="c.id">
            <td>{{ c.dni }}</td>
            <td>{{ c.nombre }} {{ c.apellido }}</td>
            <td>{{ c.celular || 'N/A' }}</td>
            <td>{{ c.direccion || 'N/A' }}</td>
            <td>{{ c.edad }}</td>
            <td>{{ c.moneda_ingresos === 'USD' ? '$' : 'S/' }}{{ Number(c.ingreso_mensual).toFixed(2) }}</td>
            <td>
              <button class="btn-icon" @click="openModal(c)">✏️</button>
              <button class="btn-icon text-red" @click="deleteClient(c.id)">🗑️</button>
            </td>
          </tr>
          <tr v-if="clients.length === 0">
            <td colspan="6" class="text-center">No hay clientes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal glass-panel">
        <h3>{{ form.id ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
        <form @submit.prevent="saveClient" class="form-grid">
          <div class="form-group"><label>DNI</label><input type="text" v-model="form.dni" required maxlength="8"/></div>
          <div class="form-group"><label>Celular</label><input type="text" v-model="form.celular" /></div>
          
          <div class="form-group"><label>Nombres</label><input type="text" v-model="form.nombre" required /></div>
          <div class="form-group"><label>Apellidos</label><input type="text" v-model="form.apellido" required /></div>
          
          <div class="form-group" style="grid-column: span 2;"><label>Dirección</label><input type="text" v-model="form.direccion" /></div>
          
          <div class="form-group"><label>Ocupación</label><input type="text" v-model="form.ocupacion" /></div>
          <div class="form-group">
            <label>Género</label>
            <select v-model="form.genero" class="select-full">
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estado Civil</label>
            <select v-model="form.estado_civil" class="select-full">
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Viudo">Viudo</option>
              <option value="Divorciado">Divorciado</option>
            </select>
          </div>
          <div class="form-group"><label>Edad</label><input type="number" v-model.number="form.edad" required /></div>
          
          <div class="form-group">
            <label>Moneda Ingreso</label>
            <select v-model="form.moneda_ingresos" class="select-full">
              <option value="PEN">Soles (S/)</option>
              <option value="USD">Dólares ($)</option>
            </select>
          </div>
          <div class="form-group"><label>Ingreso Mensual</label><input type="number" step="0.01" v-model.number="form.ingreso_mensual" required /></div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const clients = ref([]);
const showModal = ref(false);
const form = reactive({ 
  id: null, dni: '', nombre: '', apellido: '', direccion: '', 
  ocupacion: '', genero: 'Masculino', celular: '', estado_civil: 'Soltero',
  edad: 30, ingreso_mensual: 0, moneda_ingresos: 'PEN'
});

const fetchClients = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/clients');
    clients.value = res.data.data;
  } catch (e) { console.error(e); }
};

onMounted(fetchClients);

const openModal = (client = null) => {
  if(client) {
    Object.assign(form, client);
  } else {
    Object.assign(form, { 
      id: null, dni: '', nombre: '', apellido: '', direccion: '', 
      ocupacion: '', genero: 'Masculino', celular: '', estado_civil: 'Soltero',
      edad: 30, ingreso_mensual: 0, moneda_ingresos: 'PEN'
    });
  }
  showModal.value = true;
};

const saveClient = async () => {
  try {
    if(form.id) {
      await axios.put(`http://localhost:3000/api/clients/${form.id}`, form);
    } else {
      await axios.post('http://localhost:3000/api/clients', form);
    }
    showModal.value = false;
    fetchClients();
  } catch(e) { console.error(e); }
};

const deleteClient = async (id) => {
  if(confirm('¿Eliminar cliente?')) {
    try {
      await axios.delete(`http://localhost:3000/api/clients/${id}`);
      fetchClients();
    } catch(e) { console.error(e); }
  }
};
</script>

<style scoped>
.clients-page { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.table-container { overflow-x: auto; }
.text-center { text-align: center; }
.text-red { color: #ff4e4e; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin-right: 0.5rem; }

/* Modal styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 100%; max-width: 500px; padding: 2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
.form-actions { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-secondary { background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
.select-full { width: 100%; padding: 0.8rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: white; }
</style>
