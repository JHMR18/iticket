<template>
    <div>
        <v-row class="mb-4" style="padding-top: 20px; padding-left: 20px;">
            <v-col cols="12">
                <v-text-field
                    v-model="searchQuery"
                    label="Search by First Name or Last Name"
                    width="500px"
                    clearable
                    @input="filterEnforcers"
                ></v-text-field>
            </v-col>
        </v-row>

        <v-data-table
            :headers="headers"
            :items="filteredEnforcers"
            item-key="id"
            class="elevation-1"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn color="primary" @click="openEditModal(item)" small>Edit</v-btn>
                <v-btn color="error" @click="openDeleteConfirmation(item.id)" small>Delete</v-btn>
            </template>
        </v-data-table>
        <v-btn color="primary" @click="openAddUserModal">Add Enforcer</v-btn>

        <!-- Add User Modal -->
        <v-dialog v-model="isAddUserModalOpen" max-width="600px">
            <v-card>
                <v-card-title>Add Enforcer</v-card-title>
                <v-card-text>
                    <v-form ref="addUserForm">
                        <v-text-field v-model="newUser.first_name" label="First Name" required></v-text-field>
                        <v-text-field v-model="newUser.last_name" label="Last Name" required></v-text-field>
                        <v-text-field v-model="newUser.email" label="Email" required></v-text-field>
                        <v-select
                            v-model="newUser.role"
                            :items="availableRoles"
                            item-title="name"
                            item-value="id"
                            label="Role"
                            required
                        ></v-select>
                        <v-text-field
                            v-model="newUser.password"
                            label="Password"
                            type="password"
                            required
                        ></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" @click="closeAddUserModal">Cancel</v-btn>
                    <v-btn color="primary" @click="addUser">Add</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Edit Modal -->
        <v-dialog v-model="isEditModalOpen" max-width="600px">
            <v-card>
                <v-card-title>Edit Enforcer</v-card-title>
                <v-card-text>
                    <v-form ref="form">
                        <v-text-field v-model="selectedEnforcer.first_name" label="First Name" required></v-text-field>
                        <v-text-field v-model="selectedEnforcer.last_name" label="Last Name" required></v-text-field>
                        <v-text-field v-model="selectedEnforcer.email" label="Email" required></v-text-field>
                        <v-select
                            v-model="selectedEnforcer.role"
                            :items="availableRoles"
                            item-title="name"
                            item-value="id"
                            label="Role"
                            required
                        ></v-select>
                        <v-text-field
                            v-model="newPassword"
                            label="New Password"
                            type="password"
                            hint="Leave empty to keep current password"
                            persistent-hint
                        ></v-text-field>
                        <v-text-field
                            v-model="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            :error-messages="passwordError"
                        ></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" @click="closeEditModal">Cancel</v-btn>
                    <v-btn color="primary" @click="saveEnforcer" :disabled="!!passwordError">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Modal -->
        <v-dialog v-model="isDeleteConfirmationOpen" max-width="400px">
            <v-card>
                <v-card-title class="text-h6">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this enforcer?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" @click="closeDeleteConfirmation">Cancel</v-btn>
                    <v-btn color="error" @click="confirmDelete">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const token = localStorage.getItem("auth-token");
const enforcers = ref([]);
const roles = ref([]);
const isEditModalOpen = ref(false);
const isDeleteConfirmationOpen = ref(false);
const isAddUserModalOpen = ref(false);
const selectedEnforcer = ref({});
const enforcerToDelete = ref(null);
const newUser = ref({ first_name: '', last_name: '', email: '', role: '', password: '' });
const newPassword = ref('');
const confirmPassword = ref('');
const searchQuery = ref('');

const ENFORCER_ROLE_ID = 'bfc39d2e-772b-44e7-95a2-124670bc47a1';

const roleMapping = {
    [ENFORCER_ROLE_ID]: 'enforcer'
};

const api = axios.create({
    baseURL: 'http://localhost:8055',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

const headers = [
    { title: 'First Name', value: 'first_name' },
    { title: 'Last Name', value: 'last_name' },
    { title: 'Email', value: 'email' },
    { title: 'Role', value: 'displayRole' },
    { title: 'Actions', value: 'actions', sortable: false },
];

const passwordError = computed(() => {
    if (!newPassword.value && !confirmPassword.value) return '';
    if (newPassword.value && !confirmPassword.value) return 'Please confirm the password';
    if (newPassword.value !== confirmPassword.value) return 'Passwords do not match';
    if (newPassword.value && newPassword.value.length < 8) return 'Password must be at least 8 characters';
    return '';
});

const filteredEnforcers = computed(() => {
    return enforcers.value
        .filter(enforcer => enforcer.role === ENFORCER_ROLE_ID)
        .filter(enforcer => {
            const fullName = `${enforcer.first_name} ${enforcer.last_name}`.toLowerCase();
            return fullName.includes(searchQuery.value.toLowerCase());
        })
        .map(enforcer => ({
            ...enforcer,
            displayRole: roleMapping[enforcer.role] || enforcer.role
        }));
});

const availableRoles = [
    { id: ENFORCER_ROLE_ID, name: 'enforcer' }
];

onMounted(async () => {
    await fetchEnforcers();
});

const fetchEnforcers = async () => {
    try {
        const response = await api.get("/users", {
            params: {
                fields: ['id', 'first_name', 'last_name', 'email', 'role'],
                filter: {
                    role: {
                        _eq: ENFORCER_ROLE_ID
                    }
                }
            }
        });
        enforcers.value = response.data.data;
    } catch (error) {
        console.error("Error fetching enforcers:", error.response?.data || error);
    }
};

const openEditModal = (enforcer) => {
    selectedEnforcer.value = { ...enforcer };
    newPassword.value = '';
    confirmPassword.value = '';
    isEditModalOpen.value = true;
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
    selectedEnforcer.value = {};
    newPassword.value = '';
    confirmPassword.value = '';
};

const saveEnforcer = async () => {
    try {
        const updateData = {
            first_name: selectedEnforcer.value.first_name,
            last_name: selectedEnforcer.value.last_name,
            email: selectedEnforcer.value.email,
            role: selectedEnforcer.value.role
        };

        if (newPassword.value) {
            updateData.password = newPassword.value;
        }

        await api.patch(`/users/${selectedEnforcer.value.id}`, updateData);
        await fetchEnforcers();
        closeEditModal();
    } catch (error) {
        console.error("Error saving enforcer:", error.response?.data || error);
    }
};

const openDeleteConfirmation = (id) => {
    enforcerToDelete.value = id;
    isDeleteConfirmationOpen.value = true;
};

const closeDeleteConfirmation = () => {
    isDeleteConfirmationOpen.value = false;
    enforcerToDelete.value = null;
};

const confirmDelete = async () => {
    try {
        await api.delete(`/users/${enforcerToDelete.value}`);
        await fetchEnforcers();
        closeDeleteConfirmation();
    } catch (error) {
        console.error("Error deleting enforcer:", error.response?.data || error);
    }
};

const openAddUserModal = () => {
    isAddUserModalOpen.value = true;
};

const closeAddUserModal = () => {
    isAddUserModalOpen.value = false;
    newUser.value = { first_name: '', last_name: '', email: '', role: '', password: '' };
};

const addUser = async () => {
    try {
        const { first_name, last_name, email, role, password } = newUser.value;
        await api.post("/users", {
            first_name,
            last_name,
            email,
            role,
            password
        });
        await fetchEnforcers();
        closeAddUserModal();
    } catch (error) {
        console.error("Error adding user:", error.response?.data || error);
    }
};
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1.5rem;
}
</style>
