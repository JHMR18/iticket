<template>
    <v-app-bar
    color="#0F3C45"
    dark
    elevate-on-scroll
    app
    >   
    <!-- Left Side: Logo and Name -->
    <v-row align="center" no-gutters style="padding-left: 10px;">
        <v-img
        src="/logo.png"
        alt="I-Ticket Logo"
        class="logo"
        max-width="40"
        ></v-img>
        <v-toolbar-title class="ml-3">I-Ticket</v-toolbar-title>
    </v-row>

    <!-- Middle Section: Navigation Options -->
    <v-spacer></v-spacer>

    <v-row>
        <v-btn text to="/admin/processed-tickets">Processed Tickets</v-btn>
        <v-btn text to="/admin/impounded-vehicles">Impounded Vehicles</v-btn>
        <v-btn text to="/admin/violators">Violators</v-btn>
        <v-btn text to="/admin/violations">Violations</v-btn>
        <v-btn text to="/admin/vehicle-types">Vehicle Types</v-btn>
    </v-row>

    <!-- Right Side: User Info and Avatar -->
    <v-spacer></v-spacer>
    
    <v-row style=" max-width: 220px;" >
        <div class="user-info">
        <p class="user-name">{{ firstName }} {{ lastName }}</p>
        <p class="user-role">{{ role }}</p>
        </div>
        <v-avatar size="40">
        <v-img :src="userAvatar" alt="User Avatar"></v-img>
        </v-avatar>
    </v-row>
    </v-app-bar>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiUrl = 'http://localhost:8055';
const token = localStorage.getItem('auth-token');

const firstName = ref('');
const lastName = ref('');
const role = ref('');
const userAvatar = ref('');

// Fetch user details from Directus
const fetchUser = async () => {
    try {
    const response = await axios.get(`${apiUrl}/users/me?fields=first_name,last_name,role.name,avatar`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    // Set user info
    firstName.value = response.data.data.first_name;
    lastName.value = response.data.data.last_name;
    role.value = response.data.data.role.name;

    // Set avatar
    if (response.data.data.avatar) {
        userAvatar.value = `${apiUrl}/assets/${response.data.data.avatar}`;
    }
    } catch (error) {
    console.error('Error fetching user:', error);
    }
};

onMounted(() => {
    fetchUser();
});
</script>

<style scoped>
.logo {
    border-radius: 50%;
}

.user-info {
    margin-right: 16px;
    text-align: right;
}

.user-name {
    margin: 0;
    font-weight: bold;
    color: white;
}

.user-role {
    margin: 0;
    font-size: 0.8rem;
    color: lightgray;
}
</style>
