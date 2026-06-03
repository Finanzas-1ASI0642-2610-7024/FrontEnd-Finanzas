<template>
  <div class="login-container">
    <div class="glass-panel login-box">
      <h1 class="title">AutoTech</h1>
      <p class="subtitle">Financiamiento Inteligente</p>
      
      <form @submit.prevent="handleLogin">
        <label>Usuario</label>
        <input type="text" v-model="username" placeholder="Ingresa tu usuario" required />
        
        <label>Contraseña</label>
        <input type="password" v-model="password" placeholder="••••••••" required />
        
        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">Ingresar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');

const handleLogin = () => {
  // Simulando login
  if (username.value && password.value) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-box {
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.title {
  color: var(--accent-cyan);
  font-size: 2.5rem;
  margin-bottom: 0.2rem;
}
.subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
form {
  text-align: left;
}
</style>
