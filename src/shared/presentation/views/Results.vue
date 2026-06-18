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

    <div class="result-card dashboard-container" v-if="data">
      <h2 class="text-center mb-4"><i class="fas fa-chart-line"></i> Dashboard de Rentabilidad</h2>

      <!-- Tarjetas Hero (KPIs Principales) -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <i class="fas fa-money-check-alt kpi-icon"></i>
          <h4>Monto del Préstamo</h4>
          <span class="kpi-value">{{ moneda }}{{ format(data.monto_del_prestamo) }}</span>
        </div>
        <div class="kpi-card primary-card">
          <i class="fas fa-calendar-alt kpi-icon"></i>
          <h4>Cuota Referencial</h4>
          <span class="kpi-value">{{ moneda }}{{ format(data.cuota_mensual_referencial) }}</span>
        </div>
        <div class="kpi-card purple-card">
          <i class="fas fa-percentage kpi-icon"></i>
          <h4>TCEA Anual</h4>
          <span class="kpi-value">{{ format(data.TCEA * 100) }}%</span>
        </div>
        <div class="kpi-card" :class="data.VAN >= 0 ? 'green-card' : 'red-card'">
          <i class="fas fa-chart-pie kpi-icon"></i>
          <h4>VAN (Valor Actual Neto)</h4>
          <span class="kpi-value">{{ moneda }}{{ format(data.VAN) }}</span>
        </div>
      </div>

      <!-- Resumen Secundario -->
      <div class="summary-grid mt-4">
        <div class="summary-box">
          <h4><i class="fas fa-info-circle"></i> Condiciones del Préstamo</h4>
          <ul>
            <li><strong>Saldo a Financiar:</strong> {{ moneda }}{{ format(data.monto_financiado) }}</li>
            <li><strong>Total de Cuotas:</strong> {{ data.cronograma.length }}</li>
            <li><strong>Cuotas por Año:</strong> {{ format(data.dias_por_anio / data.frecuencia_pago_dias) }}</li>
            <li><strong>Tasa de Descuento:</strong> {{ format(data.TEP_COK * 100) }}%</li>
            <li><strong>TIR de Operación:</strong> {{ format(data.TIR_periodo * 100) }}%</li>
          </ul>
        </div>
        
        <div class="summary-box">
          <h4><i class="fas fa-receipt"></i> Desglose Total a Pagar</h4>
          <ul>
            <li><strong>Intereses:</strong> {{ moneda }}{{ format(data.totales?.interes) }}</li>
            <li><strong>Amortización del Capital:</strong> {{ moneda }}{{ format(data.totales?.amortizacion) }}</li>
            <li><strong>Seguros (Desgravamen + Riesgo):</strong> {{ moneda }}{{ format(data.totales?.seguro_desgravamen + data.totales?.seguro_vehicular) }}</li>
            <li><strong>Portes y Comisiones:</strong> {{ moneda }}{{ format(data.totales?.comisiones + data.totales?.portes_gastos) }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-4 text-center">
        <button class="btn-primary" @click="exportar"><i class="fas fa-file-excel"></i> Exportar a Excel</button>
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
      const com = Number(c.CostosAdicionale?.comisiones) || 0;
      costos_notariales.value = cn;
      costos_registrales.value = cr;
      tasacion.value = tas;
      comision_estudio.value = c_est;
      comision_activacion.value = c_act;
      costos_iniciales_totales.value = cn + cr + tas + c_est + c_act + com;

      const TEP_COK = Math.pow(1 + (Number(c.tasa_descuento_COK) || 0.10), (c.frecuencia_pago_dias || 30) / (c.dias_por_anio || 360)) - 1;

      let crono = [];
      if(c.DatosSalida?.cronograma_pagos_json) {
        crono = JSON.parse(c.DatosSalida.cronograma_pagos_json);
      }
      cronograma.value = crono;

      const totales_calculados = crono.reduce((acc, curr) => {
        acc.interes += curr.interes;
        acc.amortizacion += curr.amortizacion;
        acc.seguro_desgravamen += curr.seguro_desgravamen;
        acc.seguro_vehicular += curr.seguro_vehicular;
        return acc;
      }, { interes: 0, amortizacion: 0, seguro_desgravamen: 0, seguro_vehicular: 0 });

      totales_calculados.comisiones = com * crono.length;
      totales_calculados.portes_gastos = (Number(c.CostosAdicionale?.portes || 0) + Number(c.CostosAdicionale?.gastos_administracion || 0)) * crono.length;

      data.value = {
        monto_financiado: c.DatosSalida?.monto_financiado,
        monto_del_prestamo: Number(c.DatosSalida?.monto_financiado || 0) + costos_iniciales_totales.value,
        cuota_mensual_referencial: c.DatosSalida?.cuota_mensual,
        VAN: c.DatosSalida?.VAN,
        TCEA: c.DatosSalida?.TCEA,
        TEP_COK: TEP_COK,
        TIR_periodo: c.DatosSalida?.TIR,
        cronograma: crono,
        totales: totales_calculados,
        dias_por_anio: c.dias_por_anio || 360,
        frecuencia_pago_dias: c.frecuencia_pago_dias || 30,
        seguro_desgravamen: Number(c.CostosAdicionale?.seguro_desgravamen) || 0,
        seguro_vehicular_periodo: ((Number(c.CostosAdicionale?.seguro_vehicular) || 0) / (c.dias_por_anio || 360)) * (c.frecuencia_pago_dias || 30)
      };
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
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.kpi-card { background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; transition: transform 0.3s ease; }
.kpi-card:hover { transform: translateY(-5px); }
.kpi-icon { font-size: 2rem; margin-bottom: 1rem; opacity: 0.8; }
.kpi-card h4 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 500; }
.kpi-value { font-size: 1.8rem; font-weight: 700; display: block; }
.primary-card { background: rgba(0, 198, 255, 0.1); border-color: rgba(0, 198, 255, 0.3); }
.primary-card .kpi-value, .primary-card .kpi-icon { color: var(--accent-cyan); }
.purple-card { background: rgba(177, 78, 255, 0.1); border-color: rgba(177, 78, 255, 0.3); }
.purple-card .kpi-value, .purple-card .kpi-icon { color: #b14eff; }
.green-card { background: rgba(82, 196, 26, 0.1); border-color: rgba(82, 196, 26, 0.3); }
.green-card .kpi-value, .green-card .kpi-icon { color: #52c41a; }
.red-card { background: rgba(255, 77, 79, 0.1); border-color: rgba(255, 77, 79, 0.3); }
.red-card .kpi-value, .red-card .kpi-icon { color: #ff4d4f; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.summary-box { background: rgba(0, 0, 0, 0.2); border-radius: 12px; padding: 1.5rem; }
.summary-box h4 { margin-bottom: 1rem; color: var(--accent-blue); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
.summary-box ul { list-style: none; padding: 0; margin: 0; }
.summary-box li { display: flex; justify-content: space-between; margin-bottom: 0.8rem; font-size: 0.95rem; }
.summary-box li strong { color: var(--text-secondary); }
</style>
