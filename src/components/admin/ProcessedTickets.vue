<template>
    <v-container fluid>
    <v-row>
        <!-- Left Column: Analytics and Table -->
        <v-col cols="12" md="12">

        <!-- Charts -->
        <v-row dense>
            <v-col cols="12" sm="6">
            <pie-chart></pie-chart>
            </v-col>
            <v-col cols="12" sm="6">
            <ticket-line-chart></ticket-line-chart>
            </v-col>
        </v-row>
        <!-- Compact Filters -->
        <v-row dense class="mb-4">
            <v-col cols="12" sm="3">
            <v-text-field 
                v-model="searchQuery" 
                label="Search Violator's Name" 
                prepend-inner-icon="mdi-magnify" 
                variant="outlined" 
                dense
                hide-details
                clearable
            ></v-text-field>
            </v-col>
            <v-col cols="12" sm="9">
            <v-row dense>
                <v-col>
                <v-select 
                    v-model="statusFilter" 
                    :items="statusOptions" 
                    label="Ticket Status" 
                    variant="outlined" 
                    dense
                    clearable
                ></v-select>
                </v-col>
                <v-col>
                <v-select 
                    v-model="selectedYear" 
                    :items="years" 
                    label="Year" 
                    variant="outlined" 
                    dense
                    clearable
                ></v-select>
                </v-col>
                <v-col>
                <v-select 
                    v-model="selectedMonth" 
                    :items="months" 
                    item-title="title" 
                    item-value="value"
                    label="Month" 
                    variant="outlined" 
                    dense
                    clearable
                ></v-select>
                </v-col>
            </v-row>
            </v-col>
        </v-row>
        <!-- Data Table -->
        <v-data-table
            :headers="headers"
            :items="filteredTickets"
            density="compact"
            class="elevation-1 mt-4"
        >
            <template v-slot:item.actions="{ item }">
            <v-btn icon @click="openEditModal(item)" size="small">
                <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn icon color="error" @click="openDeleteConfirmation(item.ticket_id)" size="small">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            </template>
        </v-data-table>
        </v-col>
    </v-row>

    <!-- Add/Edit Modal -->
    <v-dialog v-model="isModalOpen" max-width="1200px">
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center justify-space-between pa-0 mb-4" style="background-color: transparent;">
        <div class="d-flex align-center">
          <v-chip 
            class="mr-4" 
            color="#0F3C45" 
            text-color="white" 
            label
          >
            Ticket ID: {{ formData.ticket_id }}
          </v-chip>
          
          <div class="d-flex flex-column">
            <span style="font-weight: bold; color:#0F3C45 ;" class="subtitle-2 grey--text">Citation Officer</span>
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="grey">mdi-account-badge</v-icon>
              <span style="font-weight: 600; color:#0F3C45 ;">
                {{ formData.user_created.first_name }} 
                {{ formData.user_created.last_name }}
              </span>
            </div>
          </div>
        </div>
        
        <v-chip 
          :color="getStatusColor(formData.status)"
          label
          class="status-chip"
        >
          <v-select
            v-model="formData.status"
            :items="['not paid', 'paid',]"
            dense
            solo
            flat
            hide-details
            class="status-select"
          ></v-select>
        </v-chip>
      </v-card-title>

      <v-card-text class="pt-0">
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title class="subtitle-2 grey--text text--darken-2">
                Violator Details
              </v-card-title>
              <v-card-text>
                <v-row dense>
                  <v-col cols="4">
                    <v-text-field 
                      v-model="formData.violator_id.first_name"
                      label="First Name" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field 
                      v-model="formData.violator_id.middle_name"
                      label="Middle Name" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field 
                      v-model="formData.violator_id.last_name"
                      label="Last Name" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field 
                      v-model="formData.violator_id.license_no"
                      label="License No." 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field 
                      v-model="formData.violator_id.birth_date"
                      label="Birth Date" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field 
                      v-model="formData.violator_id.address"
                      label="Address" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title class="subtitle-2 grey--text text--darken-2">
                Violation & Fee
              </v-card-title>
              <v-card-text>
                <div class="violations-container mb-3">
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
                <v-row dense>
                  <v-col cols="6">
                    <v-text-field 
                      v-model="formData.total_penalty_fee" 
                      label="Total Penalty Fee" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field 
                      v-model="formData.current_offense_count"   
                      label="Number of Offenses" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field 
                      v-model="formData.location"   
                      label="Location" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field 
                      v-model="formData.date_time" 
                      label="Ticket Issued Date/Time" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Impounded Vehicle Section (if applicable) -->
          <v-col 
            v-if="formData.impounded_vehicle_id && Object.keys(formData.impounded_vehicle_id).length > 0" 
            cols="12"
          >
            <v-card outlined>
              <v-card-title class="subtitle-2 grey--text text--darken-2">
                Impounded Vehicle Information
              </v-card-title>
              <v-card-text>
                <v-row dense>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.plate_no"
                      label="Plate No" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.registration_no"
                      label="Registration No" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.owner_name"
                      label="Owner Name" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.vehicle_utility"
                      label="Vehicle Utility" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.owner_address"
                      label="Owner Address" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.date_time"
                      label="Impound Date/Time" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.place"
                      label="Impound Place" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field 
                      v-model="formData.impounded_vehicle_id.apprehending_officer"
                      label="Apprehending Officer" 
                      readonly 
                      dense
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" @click="closeModal">Cancel</v-btn>
        <v-btn style="color: #0F3C45;" @click="saveTicket">
          {{ isEditing ? 'Save Changes' : 'Add Ticket' }}
        </v-btn>
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
    </v-container>
</template>
<script setup>
import axios from "axios";
import { ref, reactive, computed, onMounted } from "vue";
import PieChart from "./charts/PieChart.vue";
import TicketLineChart from "./charts/TicketLineChart.vue";
const token = localStorage.getItem("auth-token");
const tickets = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isDeleteConfirmationOpen = ref(false);
const ticketToDelete = ref(null);
const searchQuery = ref(""); // For searching violator's name
const statusFilter = ref(""); // For filtering by status
const statusOptions = ["not paid", "paid"]; // Status options
const selectedYear = ref(null);
const selectedMonth = ref(null);


// Generate years for the select options (e.g., from 2020 to the current year)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);

// Define month options
const months = [
    { title: 'January', value: 0 },
    { title: 'February', value: 1 },
    { title: 'March', value: 2 },
    { title: 'April', value: 3 },
    { title: 'May', value: 4 },
    { title: 'June', value: 5 },
    { title: 'July', value: 6 },
    { title: 'August', value: 7 },
    { title: 'September', value: 8 },
    { title: 'October', value: 9 },
    { title: 'November', value: 10 },
    { title: 'December', value: 11 },
];
const getStatusColor = (status) => {
    const statusColors = {
    'issued': '#FF9800',      // Orange
    'paid': 'green', 
    'not paid': 'orange',       // Green
    'impounded': '#F44336',   // Red
    'released': '#2196F3',    // Blue
    'canceled': '#9C27B0'     // Purple
  }
  return statusColors[status] || '#607D8B'
    
}
const formData = reactive({
    ticket_id: null,
    status: '',
    location: '',
    current_offense_count: '',
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
const showYearMenu = ref(false );
const showMonthMenu = ref(false);

const setYearFilter = (year) => {
    selectedYear.value = year;
    showYearMenu.value = false;
};

const clearYearFilter = () => {
    selectedYear.value = null;
    showYearMenu.value = false;
};

const setMonthFilter = (index) => {
    selectedMonth.value = index;
    showMonthMenu.value = false;
};

const clearMonthFilter = () => {
    selectedMonth.value = null;
    showMonthMenu.value = false;
};
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
                fields: "ticket_id,location,current_offense_count,date_time,violation_id.violation_type_id.*.*.*,user_created.first_name,user_created.last_name,total_penalty_fee,status,violator_id.*,impounded_vehicle_id.*",
            },
        });
        tickets.value = ticketsResponse.data.data
        // Fetch number of violations
        // const violationsResponse = await axios.get("http://localhost:8055/items/number_of_violations", {
        //     headers: { Authorization: `Bearer ${token}` },
        // });

        // // Create a mapping of violator_id to their offense counts
        // const violationCounts = {};
        // violationsResponse.data.data.forEach(violation => {
        //     const violatorId = violation.violator_id; // Get violator_id from the response
        //     if (violationCounts[violatorId]) {
        //         violationCounts[violatorId]++; // Increment count if already exists
        //     } else {
        //         violationCounts[violatorId] = 1; // Initialize count if not exists
        //     }
        // });

        // Map tickets and include the offense count
        // tickets.value = ticketsResponse.data.data.map(ticket => ({
        //     ...ticket,
        //     // Access the violator_id from the nested structure
        //     offense_count: ticket.violator_id ? violationCounts[ticket.violator_id.violator_id] || 0 : 0
        // }));
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

            // Safe extraction of violations
            const violations = ticket.violation_id?.violation_type_id
                ? ticket.violation_id.violation_type_id.map(violation => 
                    violation.violation_violation_id?.violation || 'Unknown Violation'
                ).join(', ')
                : 'No Violations';

            // Safe extraction of offense levels
            const offense_level = ticket.violation_id?.violation_type_id
                ? ticket.violation_id.violation_type_id.map(offense => 
                    offense.violation_violation_id?.level_of_offense || 'Unknown Level'
                ).join(', ')
                : 'No Offense Level';

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
                .includes(searchQuery.value.toLowerCase())) &&
            (!selectedYear.value || new Date(ticket.date_time).getFullYear() === selectedYear.value) &&
            (selectedMonth.value === null || new Date(ticket.date_time).getMonth() === selectedMonth.value)
        );
});

const openEditModal = (item) => {
    isEditing.value = true;
    formData.ticket_id = item.ticket_id;
    formData.date_time = item.date_time;
    formData.location = item.location;
    formData.current_offense_count = item.current_offense_count;

    // Handle violator_id safely
    formData.violator_id = typeof item.violator_id === 'object' 
        ? {
            first_name: item.violator_id?.first_name || '',
            middle_name: item.violator_id?.middle_name || '',
            last_name: item.violator_id?.last_name || '',
            address: item.violator_id?.address || '',
            birth_date: item.violator_id?.birth_date || '',
            license_no: item.violator_id?.license_no || '',
            issued_at: item.violator_id?.issued_at || ''
        }
        : {
            first_name: '',
            middle_name: '',
            last_name: '',
            address: '',
            birth_date: '',
            license_no: '',
            issued_at: ''
        };

    // Handle violation_id safely
    formData.violation_id = item.violation_id || [];
    
    // Format violations safely
    formData.violations = item.violation_id?.violation_type_id
        ? item.violation_id.violation_type_id.map(violation => 
            violation.violation_violation_id?.violation || 'Unknown Violation'
        ).join(', ')
        : '';

    formData.total_penalty_fee = item.total_penalty_fee || '';
    
    // Handle user_created safely
    formData.user_created = item.user_created 
        ? {
            first_name: item.user_created.first_name || '',
            last_name: item.user_created.last_name || ''
        }
        : {
            first_name: '',
            last_name: ''
        };

    formData.status = item.status || '';
    formData.impounded_vehicle_id = item.impounded_vehicle_id || {}; 
    formData.offense_count = item.offense_count || ''; 
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
        violation_id: [],
        violations: '',
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
.status-chip {
font-size: 16px;
height: 48px;
opacity: 100% !important;
}

.status-select {
width: 100%;
color: #0F3C45 !important;
}

.status-select .v-input__slot {

}

.status-select .v-select__selection {
    color: #0F3C45 !important;
}
</style>