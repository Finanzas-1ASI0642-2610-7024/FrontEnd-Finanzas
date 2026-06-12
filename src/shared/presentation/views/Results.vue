<template>
  <div class="results-page">
    <div class="header-actions">
      <h2>{{ isOtorgado ? 'Crédito Otorgado' : 'Resultados de Simulación' }}</h2>
      <div>
        <button class="btn-secondary mr" @click="$router.push('/dashboard')">Volver</button>
        <button class="btn-primary" @click="descargarExcel" v-if="creditId">Exportar Excel</button>
      </div>
    </div>

    <div class="info-section glass-panel mb" v-if="cliente">
      <div class="info-grid">
        <div>
          <h3>Datos del Cliente</h3>
          <p><strong>Nombre:</strong> {{ cliente.nombre }} (DNI: {{ cliente.dni }})</p>
          <p><strong>Dirección:</strong> {{ cliente.direccion || 'N/A' }}</p>
          <br>
          <h3>Datos del Vehículo</h3>
          <p><strong>Modelo:</strong> {{ vehiculo.marca }} {{ vehiculo.modelo }} - ${{ Number(vehiculo.precio).toFixed(2) }}</p>
        </div>
        <div v-if="vehiculo.imagen" class="photo-container">
          <img :src="vehiculo.imagen" alt="Foto del vehículo" class="car-photo" />
        </div>
      </div>
    </div>

    <div class="indicators grid">
      <div class="glass-panel indicator">
        <p>Monto Financiado</p>
        <h3>${{ format(data?.monto_financiado) }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>Cuota Referencial</p>
        <h3 class="highlight">${{ format(data?.cuota_mensual_referencial) }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>VAN</p>
        <h3 class="highlight-green">${{ format(data?.VAN) }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>TCEA</p>
        <h3 class="highlight-purple">{{ format(data?.TCEA * 100) }}%</h3>
      </div>
      <div class="glass-panel indicator">
        <p>Cuota Final (Balloon)</p>
        <h3>${{ format(data?.cuota_final) }}</h3>
      </div>
    </div>

    <div class="glass-panel table-container">
      <h3>Cronograma de Pagos</h3>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Saldo Inicial</th>
            <th>Amortización</th>
            <th>Interés</th>
            <th>Desgravamen</th>
            <th>S. Vehicular</th>
            <th>Cuota</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in cronograma" :key="row.mes">
            <td>{{ row.mes }}</td>
            <td>{{ format(row.saldo_inicial) }}</td>
            <td>{{ format(row.amortizacion) }}</td>
            <td>{{ format(row.interes) }}</td>
            <td>{{ format(row.seguro_desgravamen) }}</td>
            <td>{{ format(row.seguro_vehicular) }}</td>
            <td class="bold-cuota">{{ format(row.cuota) }}</td>
            <td>{{ format(row.saldo_final) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const data = ref(null);
const cronograma = ref([]);
const cliente = ref(null);
const vehiculo = ref(null);
const creditId = ref(null);
const isOtorgado = ref(false);

onMounted(async () => {
  creditId.value = route.query.id;
  if (creditId.value) {
    try {
      const res = await axios.get(`http://localhost:3000/api/credit/${creditId.value}`);
      const c = res.data.data;
      cliente.value = c.Cliente;
      vehiculo.value = c.Vehiculo;
      isOtorgado.value = c.estado === 'Otorgado';
      
      data.value = {
        monto_financiado: c.monto_financiado,
        cuota_mensual_referencial: c.DatosSalida?.cuota_mensual,
        TCEA: c.DatosSalida?.TCEA,
        VAN: c.DatosSalida?.VAN,
        cuota_final: c.DatosSalida?.cuota_final
      };
      if(c.DatosSalida?.cronograma_pagos_json) {
        cronograma.value = JSON.parse(c.DatosSalida.cronograma_pagos_json);
      }
    } catch(e) {
      console.error(e);
    }
  }
});

const descargarExcel = () => {
  if (creditId.value) {
    window.open(`http://localhost:3000/api/credit/${creditId.value}/excel`, '_blank');
  }
};

const format = (num) => Number(num || 0).toFixed(2);
</script>

<style scoped>
.results-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.indicator { text-align: center; padding: 1.5rem; }
.indicator p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }
.indicator h3 { font-size: 1.8rem; }
.highlight { color: var(--accent-cyan); }
.highlight-purple { color: #b14eff; }
.highlight-green { color: #52c41a; }
.table-container { overflow-x: auto; }
.bold-cuota { color: var(--accent-cyan); font-weight: 600; }
.mb { margin-bottom: 1.5rem; padding: 1.5rem; }
.mr { margin-right: 1rem; }
.btn-secondary { background: transparent; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; border: 1px solid var(--glass-border); color: white; }
.info-grid { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.photo-container { width: 250px; height: 150px; overflow: hidden; border-radius: 8px; border: 1px solid var(--glass-border); }
.car-photo { width: 100%; height: 100%; object-fit: cover; }
</style>
