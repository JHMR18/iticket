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
    
            <!-- Navigation Options with Icons -->
            <v-divider></v-divider>
            <v-list>
            <v-list-item to="/treasurer/tickets" link>
                <v-list-item-title><v-icon>mdi-ticket-confirmation</v-icon>Tickets</v-list-item-title>
            </v-list-item>
    
            <v-list-item to="/treasurer/processed-tickets" link>

                <v-list-item-title> <v-icon>mdi-check-circle-outline</v-icon> Processed Tickets</v-list-item-title>
            </v-list-item>
            </v-list>
    
            <!-- Spacer -->
            <v-spacer></v-spacer>
    
            <!-- Logout Icon at the Bottom -->
            <v-list-item @click="logout" link>
            <v-list-item-title><v-icon>mdi-logout</v-icon>Logout</v-list-item-title>
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
    const logout = () => {
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
    
    .v-list-item-icon {
        display: flex;
        align-items: center;
    }
    
    .v-list-item-title {
        display: flex;
        align-items: center;
    }
    </style>
    