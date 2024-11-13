<template>
    <div>
        <!-- Vuetify Data Table -->
        <v-data-table
            :items="violations"
            :headers="headers"
            item-key="id"
            class="elevation-1"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn color="primary" @click="openEditModal(item)" small>Edit</v-btn>
                <v-btn color="error" @click="openDeleteConfirmation(item.violation_id)" small>Delete</v-btn>
            </template>
        </v-data-table>

        <v-btn color="primary" class="mt-4" @click="openAddModal">
            Add Violation
        </v-btn>

        <!-- Add/Edit Modal -->
        <v-dialog v-model="isModalOpen" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="text-h6">{{ isEditing ? 'Edit Violation' : 'Add Violation' }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form">
                        <v-text-field v-model="formData.violation" label="Violation" required></v-text-field>
                        <v-radio-group inline v-model="formData.level_of_offense" label="Level of Offense" required >
                            <v-radio label="Grave" value="Grave"></v-radio>
                            <v-radio label="Less Grave" value="Less Grave"></v-radio>
                            <v-radio label="Minor" value="Minor"></v-radio>
                        </v-radio-group>
                        <v-text-field v-model="formData.fo_penalty_fee" label="First Offense Penalty Fee" type="number" required></v-text-field>
                        <v-text-field v-model="formData.so_penalty_fee" label="Second Offense Penalty Fee" type="number" required></v-text-field>
                        <v-text-field v-model="formData.to_penalty_fee" label="Third Offense Penalty Fee" type="number" required></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn style="color: #0F3C45;" @click="closeModal">Cancel</v-btn>
                    <v-btn style="color: #0F3C45;" text @click="saveViolation">{{ isEditing ? 'Save Changes' : 'Add Violation' }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Modal -->
        <v-dialog v-model="isDeleteConfirmationOpen" max-width="400px">
            <v-card>
                <v-card-title class="text-h6">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this violation?</v-card-text>
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
const violations = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isDeleteConfirmationOpen = ref(false);
const violationToDelete = ref(null);
const formData = reactive({
    violation_id: null,
    violation: '',
    level_of_offense: '',
    fo_penalty_fee: null,
    so_penalty_fee: null,
    to_penalty_fee: null,
});

// Define table headers
const headers = [
    { title: "Violation", value: "violation" },
    { title: "Level of Offense", value: "level_of_offense" },
    { title: "First Offense Fee", value: "fo_penalty_fee" },
    { title: "Second Offense Fee", value: "so_penalty_fee" },
    { title: "Third Offense Fee", value: "to_penalty_fee" },
    { title: "Actions", value: "actions", sortable: false },
];

onMounted(() => {
    fetchViolations();
});

const fetchViolations = async () => {
    try {
        const response = await axios.get("http://localhost:8055/items/violation", {
            headers: { Authorization: `Bearer ${token}` },
        });
        violations.value = response.data.data;
    } catch (error) {
        console.error("Error fetching violations:", error);
    }
};

const openAddModal = () => {
    isEditing.value = false;
    formData.violation_id = null;
    formData.violation = '';
    formData.level_of_offense = '';
    formData.fo_penalty_fee = null;
    formData.so_penalty_fee = null;
    formData.to_penalty_fee = null;
    isModalOpen.value = true;
};

const openEditModal = (item) => {
    isEditing.value = true;
    formData.violation_id = item.violation_id;
    formData.violation = item.violation;
    formData.level_of_offense = item.level_of_offense;
    formData.fo_penalty_fee = item.fo_penalty_fee;
    formData.so_penalty_fee = item.so_penalty_fee;
    formData.to_penalty_fee = item.to_penalty_fee;
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const saveViolation = async () => {
    try {
        if (isEditing.value) {
            // Update existing violation
            await axios.patch(`http://localhost:8055/items/violation/${formData.violation_id}`, {
                violation: formData.violation,
                level_of_offense: formData.level_of_offense,
                fo_penalty_fee: formData.fo_penalty_fee,
                so_penalty_fee: formData.so_penalty_fee,
                to_penalty_fee: formData.to_penalty_fee,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } else {
            // Add new violation
            await axios.post("http://localhost:8055/items/violation", {
                violation: formData.violation,
                level_of_offense: formData.level_of_offense,
                fo_penalty_fee: formData.fo_penalty_fee,
                so_penalty_fee: formData.so_penalty_fee,
                to_penalty_fee: formData.to_penalty_fee,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        fetchViolations();
        closeModal();
    } catch (error) {
        console.error("Error saving violation:", error);
    }
};

const openDeleteConfirmation = (id) => {
    violationToDelete.value = id;
    isDeleteConfirmationOpen.value = true;
};

const closeDeleteConfirmation = () => {
    isDeleteConfirmationOpen.value = false;
};

const confirmDelete = async () => {
    try {
        await axios.delete(`http://localhost:8055/items/violation/${violationToDelete.value}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchViolations();
        closeDeleteConfirmation();
    } catch (error) {
        console.error("Error deleting violation:", error);
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
