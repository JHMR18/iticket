<template>
    <div>
        <!-- Vuetify Data Table -->
        <v-data-table
            :items="vehicle"
            :headers="headers"
            item-key="id"
            class="elevation-1"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn color="primary" @click="openEditModal(item)" small>Edit</v-btn>
                <v-btn color="error" @click="openDeleteConfirmation(item.vehicle_id)" small>Delete</v-btn>
            </template>
        </v-data-table>

        <v-btn color="primary" class="mt-4" @click="openAddModal">
            Add Vehicle
        </v-btn>

        <!-- Add/Edit Modal -->
        <v-dialog v-model="isModalOpen" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="text-h6">{{ isEditing ? 'Edit Vehicle' : 'Add Vehicle' }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form">
                        <v-text-field v-model="formData.vehicle_code" label="Vehicle Code" required></v-text-field>
                        <v-text-field v-model="formData.vehicle_description" label="Vehicle Description" required></v-text-field>

                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn style="color: #0F3C45;" @click="closeModal">Cancel</v-btn>
                    <v-btn style="color: #0F3C45;" text @click="saveVehicle">{{ isEditing ? 'Save Changes' : 'Add Vehicle' }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

            <!-- Delete Confirmation Modal -->
            <v-dialog v-model="isDeleteConfirmationOpen" max-width="400px">
        <v-card>
            <v-card-title class="text-h6">Confirm Deletion</v-card-title>
            <v-card-text>Are you sure you want to delete this vehicle?</v-card-text>
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
import axios from "axios";
import { ref, reactive, onMounted } from "vue";

const token = localStorage.getItem("auth-token");
const vehicle = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isDeleteConfirmationOpen = ref(false);
const vehicleToDelete = ref(null);
const formData = reactive({
    vehicle_id: null,
    vehicle_code: '',
    vehicle_description: '',
});

// Define table headers
const headers = [
    { title: "Vehicle Code", value: "vehicle_code" },
    { title: "Vehicle Description", value: "vehicle_description" },
    { title: "Actions", value: "actions", sortable: false },
];

onMounted(() => {
    fetchVehicleType();
});

const fetchVehicleType = async () => {
    try {
        const response = await axios.get("http://localhost:8055/items/vehicle_type", {
            headers: { Authorization: `Bearer ${token}` },
        });
        vehicle.value = response.data.data;
    } catch (error) {
        console.error("Error fetching violations:", error);
    }
};

const openAddModal = () => {
    isEditing.value = false;
    formData.vehicle_id = null;
    formData.vehicle_description = '';
    isModalOpen.value = true;
};

const openEditModal = (item) => {
    isEditing.value = true;
    formData.vehicle_id = item.vehicle_id;
    formData.vehicle_code = item.vehicle_code;
    formData.vehicle_description = item.vehicle_description;
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    formData.value = {};
};

const saveVehicle = async () => {
    try {
        if (isEditing.value) {
            // Update existing vehicle
            await axios.patch(`http://localhost:8055/items/vehicle_type/${formData.vehicle_id}`, {
                vehicle_code: formData.vehicle_code,
                vehicle_description: formData.vehicle_description,
            }, {
                headers: { Authorization: `Bearer ${ token}` },
            });
        } else {
            // Add new vehicle
            await axios.post("http://localhost:8055/items/vehicle_type", {
                vehicle_code: formData.vehicle_code,
                vehicle_description: formData.vehicle_description,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        fetchVehicleType();
        closeModal();
    } catch (error) {
        console.error("Error saving vehicle:", error);
    }
};

const openDeleteConfirmation = (id) => {
    vehicleToDelete.value = id;
    isDeleteConfirmationOpen.value = true;
};

const closeDeleteConfirmation = () => {
    isDeleteConfirmationOpen.value = false;
};

const confirmDelete = async () => {
    try {
        await axios.delete(`http://localhost:8055/items/vehicle_type/${vehicleToDelete.value}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchVehicleType();
        closeDeleteConfirmation();
    } catch (error) {
        console.error("Error deleting vehicle:", error);
    }
};
</script>

<style>
.v-data-table thead th {
    background-color: #0F3C45 !important;
    color: white;
    font-size: 1.1rem;
}

.v-btn {
    color: #0F3C45;
}

.text-center {
    text-align: center;
}
</style>
