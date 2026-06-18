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
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.dni }} - {{ c.nombre }} {{ c.apellido }} (Ingreso: {{ c.moneda_ingresos === 'USD' ? '$' : 'S/' }}{{ Number(c.ingreso_mensual).toFixed(2) }})</option>
          </select>
        </div>

        <!-- Datos del Vehículo -->
        <h3 class="section-title">Datos del Vehículo</h3>
        <div class="form-group" style="grid-column: span 2;">
          <label>Seleccionar Vehículo</label>
          <select v-model="form.ID_Vehiculo" required class="select-full">
            <option value="" disabled>-- Elige un Vehículo --</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.marca }} {{ v.modelo }} - {{ v.anio }} ({{ v.moneda === 'USD' ? '$' : 'S/' }}{{ Number(v.precio).toFixed(2) }})</option>
          </select>
        </div>

        <!-- Datos del Crédito -->
        <!-- Datos del Crédito -->
        <h3 class="section-title">Datos del Crédito</h3>
        <div class="form-group">
          <label>Moneda del Crédito</label>
          <select v-model="form.tipo_moneda" class="select-full">
            <option value="PEN">Soles (S/)</option>
            <option value="USD">Dólares ($)</option>
          </select>
        </div>
        <div class="form-group"><label>Tipo de Cambio</label><input type="number" step="0.0001" v-model.number="form.tipo_cambio" required /></div>
        <div class="form-group" style="grid-column: span 2;">
            <small class="text-secondary">El precio del vehículo será convertido a la moneda del crédito usando el Tipo de Cambio indicado (Ej. 3.45 o 1.00 si no aplica).</small>
        </div>
        
        <div class="form-group"><label>% Cuota Inicial (Ej: 20)</label><input type="number" step="0.01" v-model.number="form.cuota_inicial_porcentaje" required /></div>
        <div class="form-group"><label>Cuota Final (Balloon) %</label><input type="number" step="0.01" v-model.number="form.cuota_final_porcentaje" required /></div>
        <div class="form-group">
          <label>Tipo de Tasa</label>
          <select v-model="form.tipo_tasa" class="select-full">
            <option value="TEA">Tasa Efectiva Anual (TEA)</option>
            <option value="TNA">Tasa Nominal Anual (TNA)</option>
          </select>
        </div>
        <div class="form-group"><label>Valor de Tasa (Ej: 0.15 para 15%)</label><input type="number" step="0.0001" v-model.number="form.tasa_interes" required /></div>
        <div class="form-group" v-if="form.tipo_tasa === 'TNA'">
          <label>Capitalización</label>
          <select v-model="form.capitalizacion" class="select-full">
            <option value="Diaria">Diaria</option>
            <option value="Mensual">Mensual</option>
          </select>
        </div>
        <div class="form-group"><label>N° de Años (Ej: 12)</label><input type="number" v-model.number="form.numero_anios" required /></div>
        <div class="form-group"><label>Frecuencia de Pago en días (Ej: 90)</label><input type="number" v-model.number="form.frecuencia_pago_dias" required /></div>
        <div class="form-group">
          <label>N° de Días por Año</label>
          <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="radio" v-model.number="form.dias_por_anio" :value="360" /> 360 (Año Comercial)</label>
            <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="radio" v-model.number="form.dias_por_anio" :value="365" /> 365 (Año Exacto)</label>
          </div>
        </div>
        
        <div class="form-group">
          <label>Tipo de Gracia</label>
          <select v-model="form.tipo_gracia" class="select-full"><option value="Ninguno">Ninguno</option><option value="Parcial">Parcial</option><option value="Total">Total</option></select>
        </div>
        <div class="form-group" v-if="form.tipo_gracia !== 'Ninguno'"><label>Periodos de Gracia</label><input type="number" v-model.number="form.periodos_gracia" /></div>
        
        <h3 class="section-title">Parámetros de Evaluación Financiera</h3>
        <div class="form-group"><label>Tasa de Descuento (COK) Ej: 0.10</label><input type="number" step="0.0001" v-model.number="form.tasa_descuento_COK" required /></div>

        <!-- Seguros y Comisiones -->
        <h3 class="section-title">Costos Iniciales (Día 0)</h3>
        <div class="form-group" style="grid-column: span 2;">
          <small class="text-secondary">Estos gastos se suman al saldo a financiar para formar el monto total del préstamo, ya que el banco los financia y no se pagan de contado.</small>
        </div>
        <div class="form-group"><label>Tasación ({{ form.tipo_moneda === 'USD' ? '$' : 'S/' }})</label><input type="number" step="0.01" v-model.number="form.tasacion" /></div>
        <div class="form-group"><label>Comisión de Estudio ({{ form.tipo_moneda === 'USD' ? '$' : 'S/' }})</label><input type="number" step="0.01" v-model.number="form.comision_estudio" /></div>
        <div class="form-group"><label>Comisión Activación ({{ form.tipo_moneda === 'USD' ? '$' : 'S/' }})</label><input type="number" step="0.01" v-model.number="form.comision_activacion" /></div>
        <div class="form-group"><label>Costos Notariales ({{ form.tipo_moneda === 'USD' ? '$' : 'S/' }})</label><input type="number" step="0.01" v-model.number="form.costos_notariales" /></div>
        <div class="form-group"><label>Costos Registrales ({{ form.tipo_moneda === 'USD' ? '$' : 'S/' }})</label><input type="number" step="0.01" v-model.number="form.costos_registrales" /></div>

        <h3 class="section-title">Seguros y Comisiones Periódicas</h3>
        <div class="form-group"><label>Portes (Fijo por cuota)</label><input type="number" step="0.01" v-model.number="form.portes" /></div>
        <div class="form-group"><label>Gastos de Administración (Fijo por cuota)</label><input type="number" step="0.01" v-model.number="form.gastos_administracion" /></div>
        <div class="form-group"><label>Comisión Periódica (Fijo por cuota)</label><input type="number" step="0.01" v-model.number="form.comisiones" /></div>
        <div class="form-group"><label>% de Seguro Desgravamen (por cuota, Ej: 0.00049)</label><input type="number" step="0.00001" v-model.number="form.seguro_desgravamen" /></div>
        <div class="form-group"><label>% de Seguro Riesgo (anual, Ej: 0.004)</label><input type="number" step="0.0001" v-model.number="form.seguro_vehicular_anual" /></div>
        
        <h3 class="section-title">Costo de Oportunidad</h3>
        <div class="form-group"><label>Tasa de Descuento (COK) Ej: 0.25 para 25%</label><input type="number" step="0.0001" v-model.number="form.tasa_descuento_COK" required /></div>

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
  tipo_moneda: 'PEN', tipo_cambio: 3.4500,
  cuota_inicial_porcentaje: 20, cuota_final_porcentaje: 30,
  tipo_tasa: 'TEA', tasa_interes: 0.15, capitalizacion: 'Mensual',
  numero_anios: 1, frecuencia_pago_dias: 30, dias_por_anio: 360,
  tipo_gracia: 'Ninguno', periodos_gracia: 0,
  tasacion: 0, comision_estudio: 0, comision_activacion: 0,
  costos_notariales: 0, costos_registrales: 0,
  portes: 0, gastos_administracion: 0,
  seguro_desgravamen: 0.0005, seguro_vehicular_anual: 0.05, comisiones: 0,
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
      form.ID_Cliente = data.ID_Cliente;
      form.ID_Vehiculo = data.ID_Vehiculo;
      form.cuota_inicial_porcentaje = parseFloat(data.cuota_inicial_porcentaje) || 20;
      form.cuota_final_porcentaje = parseFloat(data.cuota_final_porcentaje);
      form.tipo_moneda = data.tipo_moneda || 'PEN';
      form.tipo_cambio = parseFloat(data.tipo_cambio) || 1.0000;
      form.tipo_tasa = data.tipo_tasa;
      form.tasa_interes = parseFloat(data.tasa_interes);
      form.capitalizacion = data.capitalizacion;
      form.numero_anios = data.numero_anios || 1;
      form.frecuencia_pago_dias = data.frecuencia_pago_dias || 30;
      form.dias_por_anio = data.dias_por_anio || 360;
      form.tipo_gracia = data.tipo_gracia;
      form.periodos_gracia = data.periodos_gracia;
      
      form.seguro_desgravamen = parseFloat(data.CostosAdicionale?.seguro_desgravamen) || 0;
      form.seguro_vehicular_anual = parseFloat(data.CostosAdicionale?.seguro_vehicular) || 0;
      form.comisiones = parseFloat(data.CostosAdicionale?.comisiones) || 0;
      form.costos_notariales = parseFloat(data.CostosAdicionale?.costos_notariales) || 0;
      form.costos_registrales = parseFloat(data.CostosAdicionale?.costos_registrales) || 0;
      form.tasacion = parseFloat(data.CostosAdicionale?.tasacion) || 0;
      form.comision_estudio = parseFloat(data.CostosAdicionale?.comision_estudio) || 0;
      form.comision_activacion = parseFloat(data.CostosAdicionale?.comision_activacion) || 0;
      form.portes = parseFloat(data.CostosAdicionale?.portes) || 0;
      form.gastos_administracion = parseFloat(data.CostosAdicionale?.gastos_administracion) || 0;
      form.tasa_descuento_COK = parseFloat(data.tasa_descuento_COK) || 0.10;
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
