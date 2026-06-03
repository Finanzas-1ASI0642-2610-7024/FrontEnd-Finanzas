<template>
  <div class="dashboard">
    <header class="glass-panel header">
      <h2>AutoTech Panel</h2>
      <button class="btn-primary" @click="logout">Salir</button>
    </header>

    <main class="content">
      <div class="glass-panel card">
        <h3>Nueva Simulación</h3>
        <p>Calcula créditos vehiculares bajo la modalidad de Compra Inteligente.</p>
        <br>
        <button class="btn-primary" @click="$router.push('/simulate')">Comenzar Simulación</button>
      </div>

      <div class="glass-panel card">
        <h3>Historial de Créditos</h3>
        <p>No tienes simulaciones guardadas aún.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const logout = () => {
  router.push('/login');
};
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 2rem;
}
.content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.card {
  text-align: center;
  padding: 3rem 2rem;
}
.card h3 {
  color: var(--accent-blue);
  margin-bottom: 1rem;
}
</style>
