<template>
  <div class="results-page">
    <div class="header-actions">
      <h2>Resultados de Simulación</h2>
      <button class="btn-primary" @click="$router.push('/simulate')">Nueva Simulación</button>
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
          <tr v-for="row in data?.cronograma" :key="row.mes">
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

const data = ref(null);

onMounted(() => {
  const result = localStorage.getItem('simulationResult');
  if (result) {
    data.value = JSON.parse(result);
  }
});

const format = (num) => {
  return Number(num || 0).toFixed(2);
};
</script>

<style scoped>
.results-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.indicator {
  text-align: center;
  padding: 1.5rem;
}
.indicator p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.indicator h3 {
  font-size: 1.8rem;
}
.highlight {
  color: var(--accent-cyan);
}
.highlight-purple {
  color: #b14eff; /* Accent purple */
}
.table-container {
  overflow-x: auto;
}
.bold-cuota {
  color: var(--accent-cyan);
  font-weight: 600;
}
</style>
