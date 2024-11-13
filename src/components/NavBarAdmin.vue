<template>
    <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer app color="#0F3C45" dark permanent>
        <!-- Sidebar Title -->
        <v-list-item>
        <v-list-item-avatar>
            <v-img src="/logo.png" alt="I-Ticket Logo"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
            <v-list-item-title class="white--text">I-Ticket</v-list-item-title>
        </v-list-item-content>
        </v-list-item>

        <!-- Navigation Options -->
        <v-divider></v-divider>
        <v-list>
        <v-list-item to="/admin/processed-tickets" link>
            <v-list-item-title><v-icon style="margin-right: 10px;">mdi-ticket-confirmation</v-icon>Processed Tickets</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item to="/admin/impounded-vehicles" link>
            <v-list-item-title><v-icon style="margin-right: 10px;">mdi-car</v-icon>Impounded Vehicles</v-list-item-title>
        </v-list-item> -->
        <!-- <v-list-item to="/admin/violators" link>
            <v-list-item-title><v-icon style="margin-right: 10px;">mdi-account-multiple</v-icon>Violators</v-list-item-title>
        </v-list-item> -->
        <v-list-item to="/admin/violations" link>
            <v-list-item-title><v-icon style="margin-right: 10px;">mdi-alert-circle</v-icon>Violations</v-list-item-title>
        </v-list-item>
        <v-list-item to="/admin/vehicle-types" link>
            <v-list-item-title><v-icon style="margin-right: 10px;">mdi-car-search-outline</v-icon>Vehicle Types</v-list-item-title>
        </v-list-item>
        <v-list-item to="/admin/manage-users" link>
            <v-list-item-title><v-icon style="margin-right: 10px;">mdi-account-multiple-check</v-icon>Manage Users</v-list-item-title>
        </v-list-item>
        </v-list>

        <!-- Spacer -->
        <v-spacer></v-spacer>

        <!-- Logout Icon at the Bottom -->
        <v-list-item @click="logoutDialog = true" link>
        <v-list-item-title><v-icon style="margin-right: 10px;">mdi-logout</v-icon>Logout</v-list-item-title>
        </v-list-item>
    </v-navigation-drawer>

    <!-- Top App Bar (only logo and user info now) -->
    <v-app-bar color="#0F3C45" dark app>
        <v-spacer></v-spacer>

        <!-- Right Side: User Info and Avatar -->
        <v-row style="max-width: 220px;">
        <div class="user-info">
            <p class="user-name">{{ firstName }} {{ lastName }}</p>
            <p class="user-role">{{ role }}</p>
        </div>
        <v-avatar size="40">
            <v-img :src="userAvatar" alt="User Avatar"></v-img>
        </v-avatar>
        </v-row>
    </v-app-bar>

    <!-- Page content -->
    <v-main>
        <!-- Confirmation Dialog -->
        <v-dialog v-model="logoutDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">Confirm Logout</v-card-title>
                <v-card-text>Are you sure you want to log out?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" text @click="logoutDialog = false">Cancel</v-btn>
                    <v-btn color="red" text @click="confirmLogout">Logout</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <router-view></router-view>
    </v-main>
    </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const apiUrl = 'http://localhost:8055';
const token = localStorage.getItem('auth-token');

const firstName = ref('');
const lastName = ref('');
const role = ref('');
const userAvatar = ref('');
const logoutDialog = ref(false);
const router = useRouter();

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

// Logout function
const confirmLogout = () => {
    localStorage.removeItem('auth-token');
    router.push('/');
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
    