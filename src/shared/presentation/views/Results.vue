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
          <p><strong>Nombres:</strong> {{ cliente.nombre }} {{ cliente.apellido }} (DNI: {{ cliente.dni }})</p>
          <p><strong>Celular:</strong> {{ cliente.celular || 'N/A' }} | <strong>Ocupación:</strong> {{ cliente.ocupacion || 'N/A' }}</p>
          <p><strong>Dirección:</strong> {{ cliente.direccion || 'N/A' }}</p>
          <br>
          <h3>Datos del Vehículo</h3>
          <p><strong>Modelo:</strong> {{ vehiculo.marca }} {{ vehiculo.modelo }} ({{ vehiculo.estado }})</p>
          <p><strong>N° Serie:</strong> {{ vehiculo.numero_serie }} | <strong>Kilometraje:</strong> {{ vehiculo.kilometraje }} km</p>
          <p><strong>Precio Catálogo:</strong> {{ vehiculo.moneda === 'USD' ? '$' : 'S/' }}{{ Number(vehiculo.precio).toFixed(2) }} 
             <span v-if="tipo_cambio != 1" class="text-secondary">(T.C. aplicado: {{ tipo_cambio }})</span>
          </p>
          <p><strong>Costos Notariales/Registrales:</strong> {{ moneda }}{{ format(costos_notariales + costos_registrales) }} | <strong>Tasación:</strong> {{ moneda }}{{ format(tasacion) }}</p>
          <p><strong>Comisiones (Estudio/Activación):</strong> {{ moneda }}{{ format(comision_estudio + comision_activacion) }}</p>
        </div>
        <div v-if="vehiculo.imagen" class="photo-container">
          <img :src="vehiculo.imagen" alt="Foto del vehículo" class="car-photo" />
        </div>
      </div>
    </div>

    <div class="indicators grid">
      <div class="glass-panel indicator">
        <p>Monto a Financiar</p>
        <h3>{{ moneda }}{{ format(data?.monto_financiado) }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>Gastos Iniciales (Día 0)</p>
        <h3 class="text-red">-{{ moneda }}{{ format(costos_iniciales_totales) }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>VAN (Neto)</p>
        <h3 :class="data?.VAN > 0 ? 'highlight-green' : 'text-red'">{{ moneda }}{{ format(data?.VAN) }}</h3>
      </div>
      <div class="glass-panel indicator">
        <p>TCEA</p>
        <h3 class="highlight-purple">{{ format(data?.TCEA * 100) }}%</h3>
      </div>
      <div class="glass-panel indicator">
        <p>Cuota Referencial</p>
        <h3 class="highlight">{{ moneda }}{{ format(data?.cuota_mensual_referencial) }}</h3>
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
const moneda = ref('S/');
const tipo_cambio = ref(1);
const costos_iniciales_totales = ref(0);
const costos_notariales = ref(0);
const costos_registrales = ref(0);
const tasacion = ref(0);
const comision_estudio = ref(0);
const comision_activacion = ref(0);

onMounted(async () => {
  creditId.value = route.query.id;
  if (creditId.value) {
    try {
      const res = await axios.get(`http://localhost:3000/api/credit/${creditId.value}`);
      const c = res.data.data;
      cliente.value = c.Cliente;
      vehiculo.value = c.Vehiculo;
      isOtorgado.value = c.estado === 'Otorgado';
      moneda.value = c.tipo_moneda === 'USD' ? '$' : 'S/';
      tipo_cambio.value = Number(c.tipo_cambio) || 1;
      
      const cn = Number(c.CostosAdicionale?.costos_notariales) || 0;
      const cr = Number(c.CostosAdicionale?.costos_registrales) || 0;
      const tas = Number(c.CostosAdicionale?.tasacion) || 0;
      const c_est = Number(c.CostosAdicionale?.comision_estudio) || 0;
      const c_act = Number(c.CostosAdicionale?.comision_activacion) || 0;
      const com = Number(c.CostosAdicionale?.comisiones) || 0; // esta es periódica, la sumamos a la inicial si el usuario la usaba así, pero ahora es periódica.
      // Corrección: Los gastos iniciales son los que se pagan en Día 0.
      costos_notariales.value = cn;
      costos_registrales.value = cr;
      tasacion.value = tas;
      comision_estudio.value = c_est;
      comision_activacion.value = c_act;
      // La comision normal ahora se asume periódica o del día 0 según cómo la usen, el backend asume ambas. Restamos comisiones en día 0 en backend, así que lo sumamos aquí.
      costos_iniciales_totales.value = cn + cr + tas + c_est + c_act + com;

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
.text-red { color: #ff4d4f; }
.table-container { overflow-x: auto; }
.bold-cuota { color: var(--accent-cyan); font-weight: 600; }
.mb { margin-bottom: 1.5rem; padding: 1.5rem; }
.mr { margin-right: 1rem; }
.btn-secondary { background: transparent; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; border: 1px solid var(--glass-border); color: white; }
.info-grid { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.photo-container { width: 250px; height: 150px; overflow: hidden; border-radius: 8px; border: 1px solid var(--glass-border); }
.car-photo { width: 100%; height: 100%; object-fit: cover; }
</style>
