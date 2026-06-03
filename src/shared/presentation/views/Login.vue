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
        
        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (username.value && password.value) {
    loading.value = true;
    error.value = '';
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        username: username.value,
        password: password.value
      });
      
      if(res.data.success) {
        localStorage.setItem('userid', res.data.user.id);
        localStorage.setItem('role', res.data.user.rol);
        
        if(res.data.user.rol === 'admin') router.push('/admin');
        else router.push('/dashboard');
      }
    } catch(e) {
      error.value = 'Credenciales inválidas';
    } finally {
      loading.value = false;
    }
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
.error-msg {
  color: #ff4d4f;
  font-size: 0.9rem;
  margin-top: -10px;
  margin-bottom: 10px;
}
</style>
