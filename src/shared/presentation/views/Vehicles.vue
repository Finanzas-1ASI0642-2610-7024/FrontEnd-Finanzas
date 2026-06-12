<template>
  <div class="vehicles-page">
    <div class="header-actions">
      <div>
        <button class="btn-secondary" @click="$router.push('/dashboard')" style="margin-right: 1rem;">← Volver</button>
        <h2 style="display: inline-block;">Catálogo de Vehículos</h2>
      </div>
      <button class="btn-primary" @click="openModal()">+ Nuevo Vehículo</button>
    </div>

    <div class="glass-panel table-container">
      <table>
        <thead>
          <tr>
            <th>Foto</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Estado</th>
            <th>Kilometraje</th>
            <th>Año</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vehicles" :key="v.id">
            <td>
              <img v-if="v.imagen" :src="v.imagen" class="car-thumb" alt="Foto Auto" />
              <div v-else class="car-thumb-placeholder">Sin Foto</div>
            </td>
            <td>{{ v.marca }}</td>
            <td>{{ v.modelo }}</td>
            <td>{{ v.estado }}</td>
            <td>{{ v.kilometraje }} km</td>
            <td>{{ v.anio }}</td>
            <td>${{ Number(v.precio).toFixed(2) }}</td>
            <td>
              <button class="btn-icon" @click="openModal(v)">✏️</button>
              <button class="btn-icon text-red" @click="deleteVehicle(v.id)">🗑️</button>
            </td>
          </tr>
          <tr v-if="vehicles.length === 0">
            <td colspan="6" class="text-center">No hay vehículos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal glass-panel">
        <h3>{{ form.id ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h3>
        <form @submit.prevent="saveVehicle" class="form-grid">
          <div class="form-group"><label>Marca</label><input type="text" v-model="form.marca" required /></div>
          <div class="form-group"><label>Modelo</label><input type="text" v-model="form.modelo" required /></div>
          
          <div class="form-group">
            <label>Estado</label>
            <select v-model="form.estado" class="select-full">
              <option value="Nuevo">Nuevo</option>
              <option value="Seminuevo">Seminuevo</option>
              <option value="Usado">Usado</option>
            </select>
          </div>
          <div class="form-group"><label>N° Serie</label><input type="text" v-model="form.numero_serie" required /></div>
          
          <div class="form-group"><label>Kilometraje</label><input type="number" v-model.number="form.kilometraje" required /></div>
          <div class="form-group"><label>Año</label><input type="number" v-model.number="form.anio" required /></div>
          <div class="form-group"><label>Precio ($)</label><input type="number" step="0.01" v-model.number="form.precio" required /></div>
          
          <div class="form-group" style="grid-column: span 2;">
            <label>Foto del Vehículo</label>
            <input type="file" accept="image/*" @change="onFileChange" />
            <img v-if="form.imagen" :src="form.imagen" class="preview-img" alt="Preview" />
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="uploading">{{ uploading ? 'Cargando...' : 'Guardar' }}</button>
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
const vehicles = ref([]);
const showModal = ref(false);
const uploading = ref(false);
const form = reactive({ 
  id: null, marca: '', modelo: '', anio: 2024, precio: 0, 
  estado: 'Nuevo', numero_serie: '', kilometraje: 0, imagen: '' 
});

const fetchVehicles = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/vehicles');
    vehicles.value = res.data.data;
  } catch (e) { console.error(e); }
};

onMounted(fetchVehicles);

const openModal = (vehicle = null) => {
  if(vehicle) {
    Object.assign(form, vehicle);
  } else {
    Object.assign(form, { 
      id: null, marca: '', modelo: '', anio: 2024, precio: 0, 
      estado: 'Nuevo', numero_serie: '', kilometraje: 0, imagen: '' 
    });
  }
  showModal.value = true;
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  uploading.value = true;
  const reader = new FileReader();
  reader.onload = (event) => {
    form.imagen = event.target.result; // Base64 string
    uploading.value = false;
  };
  reader.readAsDataURL(file);
};

const saveVehicle = async () => {
  try {
    if(form.id) {
      await axios.put(`http://localhost:3000/api/vehicles/${form.id}`, form);
    } else {
      await axios.post('http://localhost:3000/api/vehicles', form);
    }
    showModal.value = false;
    fetchVehicles();
  } catch(e) { console.error(e); }
};

const deleteVehicle = async (id) => {
  if(confirm('¿Eliminar vehículo?')) {
    try {
      await axios.delete(`http://localhost:3000/api/vehicles/${id}`);
      fetchVehicles();
    } catch(e) { console.error(e); }
  }
};
</script>

<style scoped>
.vehicles-page { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.table-container { overflow-x: auto; }
.text-center { text-align: center; }
.text-red { color: #ff4e4e; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin-right: 0.5rem; }

.car-thumb { width: 60px; height: 40px; object-fit: cover; border-radius: 4px; }
.car-thumb-placeholder { width: 60px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #ccc; }
.preview-img { width: 100%; max-width: 200px; margin-top: 1rem; border-radius: 8px; }

/* Modal styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 100%; max-width: 500px; padding: 2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
.form-actions { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-secondary { background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
.select-full { width: 100%; padding: 0.8rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: white; }
</style>
