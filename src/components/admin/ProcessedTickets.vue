<template>
    <div>
        <!-- Search and Filter -->
        <v-row class="mb-4" style="padding-top: 20px; padding-left: 20px;">
            <v-col cols="6" sm="4">
                <v-text-field
                    v-model="searchQuery"
                    label="Search by Violator's Name"
                    clearable
                    variant="outlined"
                ></v-text-field>
            </v-col>
            <v-col cols="6" sm="4">
                <v-menu v-model="showStatusMenu" :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                        <v-btn
                            v-bind="props"
                            color="#0F3C45"
                            class="filter-btn"
                            style="margin-right: 15px; height: 50px;"
                            :prepend-icon="statusFilter ? '' : 'mdi-menu-down'"
                        >
                            Status: {{ statusFilter || 'Select Status' }}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="status in statusOptions"
                            :key="status"
                            @click="setStatusFilter(status)"
                        >
                            <v-list-item-title>{{ status }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="clearStatusFilter">
                            <v-list-item-title>
                                <v-icon start>mdi-close</v-icon>Clear Filter
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>

        <v-data-table
            :headers="headers"
            :items="filteredTickets"
            item-key="ticket_id"
            class="elevation-1"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn color="primary" @click="openEditModal(item)" small>Details</v-btn>
                <v-btn color="error" @click="openDeleteConfirmation(item.ticket_id)" small>Delete</v-btn>
            </template>
        </v-data-table>

        <!-- Add/Edit Modal -->
        <v-dialog v-model="isModalOpen" max-width="1200px">
            <v-card>
                <v-card-title class="title" style="background-color: #0F3C45; color: white;">
                    <span>{{ isEditing ? 'Ticket' : 'Add Ticket' }}</span>
                </v-card-title>

                <v-card-text>
                    <v-row>
                        <v-col :cols="formData.impounded_vehicle_id && Object.keys(formData.impounded_vehicle_id).length > 0 ? 6 : 12">
                            <v-form ref="form">
                                <!-- Ticket Details Section -->
                                <v-divider></v-divider>
                                <h3 class="section-title">Ticket Details</h3>
                                <v-row>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.ticket_id" label="Ticket ID" required></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.date_time" label="Date and Time" required></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-select
                                            v-model="formData.status"
                                            :items="['issued', 'paid', 'impounded', 'released', 'canceled']"
                                            label="Status"
                                            required
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.violator_id.issued_at" label="Issued At" required></v-text-field>
                                    </v-col>
                                </v-row>

                                <!-- Violator Details Section -->
                                <v-divider class="my-3"></v-divider>
                                <h3 class="section-title">Violator Details</h3>
                                <v-row>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.violator_id.first_name" label="First Name" required></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
 <v-text-field v-model="formData.violator_id.middle_name" label="Middle Name"></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.violator_id.last_name" label="Last Name" required></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.violator_id.address" label="Address" required></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.violator_id.birth_date" label="Birth Date" required></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.violator_id.license_no" label="License No." required></v-text-field>
                                    </v-col>
                                </v-row>

                                <!-- Enforcer Details Section -->
                                <v-divider class="my-3"></v-divider>
                                <h3 class="section-title">Citation Officer</h3>
                                <v-row>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.user_created.first_name" label="First Name" required></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="formData.user_created.last_name" label="Last Name" required></v-text-field>
                                    </v-col>
                                </v-row>

                                <!-- Violation and Status Section -->
                                <v-divider class="my-3"></v-divider>
                                <h3 class="section-title">Violation & Fee</h3>
                                <v-row>
                                    <v-col cols="12">
                                        <div class="violations-container">
                                            <v-chip
                                                v-for="(violation, index) in formData.violations.split(', ')"
                                                :key="index"
                                                class="ma-1"
                                                color="#0F3C45"
                                                text-color="white"
                                                small
                                            >
                                                {{ violation }}
                                            </v-chip>
                                        </div>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field 
                                            v-model="formData.total_penalty_fee" 
                                            label="Total Penalty Fee" 
                                            readonly
                                            required
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                    <v-text-field 
                                        v-model="formData.offense_count" 
                                        label="Number of Offenses" 
                                        readonly
                                    ></v-text-field>
                                </v-col>
                                </v-row>
                            </v-form>
                        </v-col>

                        <!-- Impounded Vehicle Information -->
                        <v-col cols="6" v-if="formData.impounded_vehicle_id && Object.keys(formData.impounded_vehicle_id).length > 0">
                            <v-divider class="my-3"></v-divider>
                            <h3 class="section-title">Impounded Vehicle Information</h3>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.apprehending_officer" label="Apprehending Officer" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.date_time" label="Date/Time" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.owner_address" label="Owner Address" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.owner_name" label="Owner Name" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.place" label="Place" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.plate_no" label="Plate No" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.registration_no" label="Registration No" readonly></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="formData.impounded_vehicle_id.vehicle_utility" label="Vehicle Utility" readonly></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" @click="closeModal">Cancel</v-btn>
                    <v-btn style="color: #0F3C45;" @click="saveTicket">{{ isEditing ? 'Save Changes' : 'Add Ticket' }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Modal -->
        <v-dialog v-model="isDeleteConfirmationOpen" max-width="400px">
            <v-card>
                <v-card-title class="text-h6">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this ticket?</v-card-text>
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
import { ref, reactive, computed, onMounted } from "vue";

const token = localStorage.getItem("auth-token");
const tickets = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isDeleteConfirmationOpen = ref(false);
const ticketToDelete = ref(null);
const searchQuery = ref(""); // For searching violator's name
const statusFilter = ref(""); // For filtering by status
const statusOptions = ["issued", "paid", "impounded", "released", "canceled"]; // Status options
const formData = reactive({
    ticket_id: null,
    status: '',
    date_time: '',
    violator_id: {
        violator_id:'',
        first_name: '',
        middle_name: '',
        last_name: '',
        address: '',
        birth_date: '',
        license_no: '',
        issued_at: ''
    },
    violation_id: '',
    total_penalty_fee: '',
    offense_status: '',
    user_created: {
        first_name: '',
        last_name: ''
    },
    impounded_vehicle_id: {}
});

// Define table headers
const headers = [
    { title: "Ticket ID", value: "ticket_id" },
    { title: "Citation Officer", value: "user" },
    { title: "Date and Time", value: "formatted_date_time" },
    { title: "First Name", value: "violator_id.first_name" }, 
    { title: "Middle Name", value: "violator_id.middle_name" }, 
    { title: "Last Name", value: "violator_id.last_name" }, 
    { title: "Violation", value: "violations" },
    { title: "Level of Offense", value: "offense_level" },
    { title: "Penalty Fee", value: "total_penalty_fee" },
    { title: "Ticket Status", value: "status" },
    { title: "Actions", value: "actions", sortable: false },
];

const showStatusMenu = ref(false);

const setStatusFilter = (status) => {
    statusFilter.value = status;
    showStatusMenu.value = false;
};

const clearStatusFilter = () => {
    statusFilter.value = '';
    showStatusMenu.value = false;
};

onMounted(() => {
    fetchTickets();
});

const fetchTickets = async () => {
    try {
        // Fetch tickets
        const ticketsResponse = await axios.get("http://localhost:8055/items/tickets", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                fields: "ticket_id,date_time,violation_id.violation_violation_id.violation,violation_id.violation_violation_id.level_of_offense,user_created.first_name,user_created.last_name,total_penalty_fee,status,violator_id.*,impounded_vehicle_id.*",
            },
        });
        
        // Fetch number of violations
        const violationsResponse = await axios.get("http://localhost:8055/items/number_of_violations", {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Create a mapping of violator_id to their offense counts
        const violationCounts = {};
        violationsResponse.data.data.forEach(violation => {
            const violatorId = violation.violator_id; // Get violator_id from the response
            if (violationCounts[violatorId]) {
                violationCounts[violatorId]++; // Increment count if already exists
            } else {
                violationCounts[violatorId] = 1; // Initialize count if not exists
            }
        });

        // Map tickets and include the offense count
        tickets.value = ticketsResponse.data.data.map(ticket => ({
            ...ticket,
            // Access the violator_id from the nested structure
            offense_count: ticket.violator_id ? violationCounts[ticket.violator_id.violator_id] || 0 : 0

        }));
    } catch (error) {
        console.error("Error fetching tickets:", error);
    }
};

// Computed property to filter and search tickets
const filteredTickets = computed(() => {
    return tickets.value
        .map(ticket => {
            const dateObj = new Date(ticket.date_time);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            const violations = ticket.violation_id.map(violation => 
                violation.violation_violation_id.violation
            ).join(', ');
            const offense_level = ticket.violation_id.map(offense => 
                offense.violation_violation_id.level_of_offense
            ).join(', ');

            const user = ticket.user_created ? ticket.user_created.first_name : "N/A";

            return {
                ...ticket,
                formatted_date_time: `${formattedDate}, ${formattedTime}`,
                violations,
                offense_level,
                user,
                user_last_name: ticket.user_created?.last_name || "N/A",
                violator_first_name: ticket.violator_id?.first_name || "N/A",
                violator_middle_name: ticket.violator_id?.middle_name || "N/A",
                violator_last_name: ticket.violator_id?.last_name || "N/A"
            };
        })
        .filter(ticket => 
            (!statusFilter.value || ticket.status === statusFilter.value) &&
            (!searchQuery.value || 
                `${ticket.violator_first_name} ${ticket.violator_middle_name} ${ticket.violator_last_name}`
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()))
        );
});

const openEditModal = (item) => {
    isEditing.value = true;
    formData.ticket_id = item.ticket_id;
    formData.date_time = item.date_time;
    formData.violator_id = {
        first_name: item.violator_id.first_name,
        middle_name: item.violator_id.middle_name,
        last_name: item.violator_id.last_name,
        address: item.violator_id.address,
        birth_date: item.violator_id.birth_date,
        license_no: item.violator_id.license_no,
        issued_at: item.violator_id.issued_at
    };
    formData.violation_id = item.violation_id; // Keep the original array for potential use
    formData.violations = item.violation_id.map(violation => violation.violation_violation_id.violation).join(', '); // Format violations
    formData.total_penalty_fee = item.total_penalty_fee;
    formData.user_created = {
        first_name: item.user_created.first_name,
        last_name: item.user_created.last_name
    };
    formData.status = item.status;
    formData.impounded_vehicle_id = item.impounded_vehicle_id || {}; 
    formData.offense_count = item.offense_count; // Assign the offense count
    isModalOpen.value = true;
};
const closeModal = () => {
    isModalOpen.value = false;
    Object.assign(formData, {
        ticket_id: null,
        status: '',
        date_time: '',
        violator_id: {
            first_name: '',
            middle_name: '',
            last_name: '',
            address: '',
            birth_date: '',
            license_no: '',
            issued_at: ''
        },
        violation_id: '',
        total_penalty_fee: '',
        offense_status: '',
        user_created: {
            first_name: '',
            last_name: ''
        },
        impounded_vehicle_id: {}
    });
};

const saveTicket = async () => {
    try {
        if (isEditing.value) {
            // Prepare the data to be sent for the update
            const updateData = {
                status: formData.status,
            };

            // Send the update request
            await axios.patch(`http://localhost:8055/items/tickets/${formData.ticket_id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } else {
            // Create a new ticket
            await axios.post("http://localhost:8055/items/tickets", {
                date_time: formData.date_time,
                violator_id: formData.violator_id, // This should be a new violator object
                violation_id: formData.violation_id,
                offense_status: formData.offense_status,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        // Fetch tickets again to update the list
        fetchTickets();
        closeModal();
    } catch (error) {
        console.error("Error saving ticket:", error);
    }
};
const openDeleteConfirmation = (id) => {
    ticketToDelete.value = id;
    isDeleteConfirmationOpen.value = true;
};

const closeDeleteConfirmation = () => {
    isDeleteConfirmationOpen.value = false;
};

const confirmDelete = async () => {
    try {
        await axios.delete(`http://localhost:8055/items/tickets/${ticketToDelete.value}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchTickets();
        closeDeleteConfirmation();
    } catch (error) {
        console.error("Error deleting ticket:", error);
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
.section-title {
    font-size: 1.1rem;
    color: #0F3C45;
    font-weight: bold;
    margin-bottom: 10px;
}
.v-divider {
    background-color: #0F3C45;
}
.v-btn {
    color: #0F3C45;
}
.violations-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    min-height: 48px;
}
.v-card__text {
    max-height: 70vh;
    overflow-y: auto;
}
</style>