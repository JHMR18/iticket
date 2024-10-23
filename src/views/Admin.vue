<template>
    <NavBarAdmin>  </NavBarAdmin>
    <div>
        <h1>Admin Page</h1>
    </div>
    <v-main>
    <router-view />
  </v-main>
</template>
<script setup>
import axios from 'axios';
import { ref,onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBarAdmin from '@/components/NavBarAdmin.vue';

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