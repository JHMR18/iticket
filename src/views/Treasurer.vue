<template>
  <!-- Navbar should always be present -->
  <NabBar /> 

  <!-- Router View to dynamically load content for nested pages -->
  <v-main>
    <router-view />
  </v-main>
</template>
<script setup>
import axios from 'axios';
import { ref,onMounted } from 'vue';
import { useRouter,} from 'vue-router';
import NabBar from '../components/NabBar.vue';

const router = useRouter(); 
const apiUrl = 'http://localhost:8055';
const token = localStorage.getItem('auth-token');




onMounted(() => {
  if (!token) {
    router.push('/');
  } 
})
</script>
<style scoped>
    
</style>