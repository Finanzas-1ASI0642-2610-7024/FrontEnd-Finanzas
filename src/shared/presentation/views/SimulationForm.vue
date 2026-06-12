<template>
  <div class="simulation-form">
    <div class="header-actions">
      <div>
        <button class="btn-secondary" @click="$router.push('/dashboard')" style="margin-right: 1rem;">← Volver</button>
        <h2 style="display: inline-block;">{{ isEditing ? 'Editar Simulación' : 'Nueva Simulación' }}</h2>
      </div>
    </div>
    <div class="glass-panel">
      <form @submit.prevent="submitSimulation" class="form-grid">
        
        <!-- Datos del Cliente -->
        <h3 class="section-title">Datos del Cliente</h3>
        <div class="form-group" style="grid-column: span 2;">
          <label>Seleccionar Cliente</label>
          <select v-model="form.ID_Cliente" required class="select-full">
            <option value="" disabled>-- Elige un Cliente --</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.dni }} - {{ c.nombre }} {{ c.apellido }} (Ingreso: {{ form.tipo_moneda === 'USD' ? '$' : 'S/' }}{{ Number(c.ingreso_mensual).toFixed(2) }})</option>
          </select>
        </div>

        <!-- Datos del Vehículo -->
        <h3 class="section-title">Datos del Vehículo</h3>
        <div class="form-group" style="grid-column: span 2;">
          <label>Seleccionar Vehículo</label>
          <select v-model="form.ID_Vehiculo" required class="select-full">
            <option value="" disabled>-- Elige un Vehículo --</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.marca }} {{ v.modelo }} - {{ v.anio }} ({{ form.tipo_moneda === 'USD' ? '$' : 'S/' }}{{ Number(v.precio).toFixed(2) }})</option>
          </select>
        </div>

        <!-- Datos del Crédito -->
        <!-- Datos del Crédito -->
        <h3 class="section-title">Datos del Crédito</h3>
        <div class="form-group" style="grid-column: span 2;">
          <label>Moneda del Crédito</label>
          <select v-model="form.tipo_moneda" class="select-full">
            <option value="PEN">Soles (S/)</option>
            <option value="USD">Dólares ($)</option>
          </select>
        </div>
        <div class="form-group"><label>Cuota Inicial ({{ form.tipo_moneda === 'USD' ? '$' : 'S/' }})</label><input type="number" step="0.01" v-model.number="form.cuota_inicial" required /></div>
        <div class="form-group"><label>Cuota Final (Balloon) %</label><input type="number" step="0.01" v-model.number="form.cuota_final_porcentaje" required /></div>
        <div class="form-group">
          <label>Plazo (meses)</label>
          <select v-model.number="form.plazo_meses"><option value="24">24</option><option value="36">36</option></select>
        </div>
        <div class="form-group">
          <label>Tipo de Tasa</label>
          <select v-model="form.tipo_tasa"><option value="TEA">TEA</option><option value="TNA">TNA</option></select>
        </div>
        <div class="form-group"><label>Tasa de Interés (Ej: 0.15 para 15%)</label><input type="number" step="0.0001" v-model.number="form.tasa_interes" required /></div>
        <div class="form-group" v-if="form.tipo_tasa === 'TNA'">
          <label>Capitalización</label>
          <select v-model="form.capitalizacion"><option value="Diaria">Diaria</option><option value="Mensual">Mensual</option></select>
        </div>
        <div class="form-group">
          <label>Tipo de Gracia</label>
          <select v-model="form.tipo_gracia"><option value="Ninguno">Ninguno</option><option value="Parcial">Parcial</option><option value="Total">Total</option></select>
        </div>
        <div class="form-group" v-if="form.tipo_gracia !== 'Ninguno'"><label>Periodos de Gracia</label><input type="number" v-model.number="form.periodos_gracia" /></div>
        
        <h3 class="section-title">Parámetros de Evaluación Financiera</h3>
        <div class="form-group"><label>Tasa de Descuento (COK) Ej: 0.10</label><input type="number" step="0.0001" v-model.number="form.tasa_descuento_COK" required /></div>

        <!-- Seguros y Comisiones -->
        <h3 class="section-title">Seguros y Comisiones</h3>
        <h3 class="section-title">Seguros y Comisiones</h3>
        <div class="form-group"><label>Seguro Desgravamen (mensual, Ej: 0.0005)</label><input type="number" step="0.00001" v-model.number="form.seguro_desgravamen" /></div>
        <div class="form-group"><label>Seguro Vehicular (anual, Ej: 0.05)</label><input type="number" step="0.0001" v-model.number="form.seguro_vehicular_anual" /></div>
        <div class="form-group"><label>Comisiones (Monto fijo en {{ form.tipo_moneda === 'USD' ? '$' : 'S/' }})</label><input type="number" step="0.01" v-model.number="form.comisiones" /></div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="loading">{{ loading ? 'Calculando...' : 'Calcular y Guardar' }}</button>
          <button type="button" class="btn-secondary" @click="$router.push('/dashboard')">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const isEditing = ref(false);
const clients = ref([]);
const vehicles = ref([]);

const form = reactive({
  id: null,
  ID_Cliente: '', ID_Vehiculo: '',
  tipo_moneda: 'PEN',
  cuota_inicial: 4000, cuota_final_porcentaje: 30,
  tipo_tasa: 'TEA', tasa_interes: 0.15, capitalizacion: 'Mensual',
  plazo_meses: 36, tipo_gracia: 'Ninguno', periodos_gracia: 0,
  seguro_desgravamen: 0.0005, seguro_vehicular_anual: 0.05, comisiones: 150,
  tasa_descuento_COK: 0.10
});

onMounted(async () => {
  try {
    const [clientsRes, vehiclesRes] = await Promise.all([
      axios.get('http://localhost:3000/api/clients'),
      axios.get('http://localhost:3000/api/vehicles')
    ]);
    clients.value = clientsRes.data.data;
    vehicles.value = vehiclesRes.data.data;
  } catch(e) { console.error('Error fetching catalogs', e); }

  const creditId = route.query.id;
  if (creditId) {
    isEditing.value = true;
    try {
      const res = await axios.get(`http://localhost:3000/api/credit/${creditId}`);
      const data = res.data.data;
      
      form.id = data.id;
      form.ID_Cliente = data.Cliente?.id || '';
      form.ID_Vehiculo = data.Vehiculo?.id || '';
      
      form.cuota_inicial = parseFloat(data.cuota_inicial);
      form.cuota_final_porcentaje = parseFloat(data.cuota_final_porcentaje);
      form.tipo_moneda = data.tipo_moneda || 'PEN';
      form.tipo_tasa = data.tipo_tasa;
      form.tasa_interes = parseFloat(data.tasa_interes);
      form.capitalizacion = data.capitalizacion;
      form.plazo_meses = data.plazo_meses;
      form.tipo_gracia = data.tipo_gracia;
      form.periodos_gracia = data.periodos_gracia;
      
      form.seguro_desgravamen = parseFloat(data.CostosAdicionale?.seguro_desgravamen || 0.0005);
      form.seguro_vehicular_anual = parseFloat(data.CostosAdicionale?.seguro_vehicular || 0.05);
      form.comisiones = parseFloat(data.CostosAdicionale?.comisiones || 150);
    } catch(e) {
      console.error(e);
    }
  }
});

const submitSimulation = async () => {
  loading.value = true;
  try {
    const headers = { userid: localStorage.getItem('userid') };
    const response = await axios.post('http://localhost:3000/api/credit/simulate', form, { headers });
    router.push(`/results?id=${response.data.data.id}`);
  } catch(e) {
    console.error("Error", e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.simulation-form { padding: 2rem; max-width: 800px; margin: 0 auto; }
.header-actions { margin-bottom: 2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
.section-title { grid-column: span 2; color: var(--accent-blue); margin-top: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; }
.form-actions { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.btn-secondary { background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }
.select-full { width: 100%; padding: 0.8rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: white; }
</style>
