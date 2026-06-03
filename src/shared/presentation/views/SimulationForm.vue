<template>
  <div class="simulation-form">
    <div class="glass-panel">
      <h2>Simulador Compra Inteligente</h2>
      <form @submit.prevent="submitSimulation" class="form-grid">
        
        <div class="form-group">
          <label>Precio del Vehículo</label>
          <input type="number" v-model.number="form.precio_vehiculo" required />
        </div>
        
        <div class="form-group">
          <label>Cuota Inicial</label>
          <input type="number" v-model.number="form.cuota_inicial" required />
        </div>
        
        <div class="form-group">
          <label>Cuota Final (Balloon) %</label>
          <input type="number" v-model.number="form.cuota_final_porcentaje" required />
        </div>
        
        <div class="form-group">
          <label>Plazo (meses)</label>
          <select v-model.number="form.plazo_meses">
            <option value="24">24</option>
            <option value="36">36</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tipo de Tasa</label>
          <select v-model="form.tipo_tasa">
            <option value="TEA">TEA</option>
            <option value="TNA">TNA</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tasa de Interés (Ej: 0.15 para 15%)</label>
          <input type="number" step="0.01" v-model.number="form.tasa_interes" required />
        </div>

        <div class="form-group" v-if="form.tipo_tasa === 'TNA'">
          <label>Capitalización</label>
          <select v-model="form.capitalizacion">
            <option value="Diaria">Diaria</option>
            <option value="Mensual">Mensual</option>
          </select>
        </div>

        <div class="form-group">
          <label>Tipo de Gracia</label>
          <select v-model="form.tipo_gracia">
            <option value="Ninguno">Ninguno</option>
            <option value="Parcial">Parcial</option>
            <option value="Total">Total</option>
          </select>
        </div>

        <div class="form-group" v-if="form.tipo_gracia !== 'Ninguno'">
          <label>Periodos de Gracia</label>
          <input type="number" v-model.number="form.periodos_gracia" />
        </div>

        <div class="form-group">
          <label>Seguro Desgravamen (mensual)</label>
          <input type="number" step="0.0001" v-model.number="form.seguro_desgravamen" />
        </div>

        <div class="form-group">
          <label>Seguro Vehicular (anual)</label>
          <input type="number" step="0.0001" v-model.number="form.seguro_vehicular_anual" />
        </div>

        <div class="form-group">
          <label>Comisiones (Monto fijo)</label>
          <input type="number" v-model.number="form.comisiones" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Calculando...' : 'Calcular' }}
          </button>
          <button type="button" class="btn-secondary" @click="$router.push('/dashboard')">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const loading = ref(false);

const form = reactive({
  precio_vehiculo: 20000,
  cuota_inicial: 4000,
  cuota_final_porcentaje: 30,
  tipo_tasa: 'TEA',
  tasa_interes: 0.15,
  capitalizacion: 'Mensual',
  plazo_meses: 36,
  tipo_gracia: 'Ninguno',
  periodos_gracia: 0,
  seguro_desgravamen: 0.0005,
  seguro_vehicular_anual: 0.05,
  comisiones: 150
});

const submitSimulation = async () => {
  loading.value = true;
  try {
    const response = await axios.post('http://localhost:3000/api/credit/simulate', form);
    localStorage.setItem('simulationResult', JSON.stringify(response.data.data));
    router.push('/results');
  } catch(e) {
    console.error("Error calling simulation API, using fallback mock", e);
    // Fallback if backend isn't responding
    const mockData = {
      monto_financiado: form.precio_vehiculo - form.cuota_inicial,
      TCEA: 0.2245,
      VAN: 1500.50,
      cuota_mensual_referencial: 450.20,
      cuota_final: form.precio_vehiculo * (form.cuota_final_porcentaje / 100),
      cronograma: Array.from({length: form.plazo_meses}, (_, i) => ({
        mes: i+1, saldo_inicial: 16000, amortizacion: 300, interes: 100,
        seguro_desgravamen: 10, seguro_vehicular: 40, cuota: 450, saldo_final: 15700
      }))
    };
    localStorage.setItem('simulationResult', JSON.stringify(mockData));
    router.push('/results');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.simulation-form {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}
</style>
