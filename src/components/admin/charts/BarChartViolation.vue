<template>
    <v-card class="p-4 chart-container" elevation="2">
        <!-- Year Filter -->
        <v-row align="center" justify="start" class="mb-2">
            <span v-if="selectedYear" class="selected-filters">
                Year: {{ selectedYear }}
            </span>
            <v-menu v-model="menu" activator="parent" offset-y :close-on-content-click="false">
                <template #activator="{ props }">
                    <v-btn color="#088F8F" v-bind="props" class="mb-2" variant="text" icon>
                        <v-icon>mdi-filter-variant</v-icon>
                    </v-btn>
                </template>

                <!-- Filter Menu Content -->
                <v-list class="filter-menu">
                    <v-list-item>
                        <v-select
                            v-model="selectedYear"
                            :items="years"
                            label="Select Year"
                            clearable
                            variant="outlined"
                            style="padding: 5px;"
                        ></v-select>
                    </v-list-item>
                    <v-list-item>
                        <v-btn @click="fetchViolationData" color="#088F8F" class="mt-2" block>
                            Filter Year
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-row>

        <v-divider></v-divider>

        <!-- Chart Canvas -->
        <v-row>
            <v-col>
                <canvas ref="violationChart" style="max-width: 100%; height: 400px;"></canvas>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';

// Register Chart.js components
Chart.register(...registerables, ChartDataLabels);

const violationEndpoint = 'http://localhost:8055/items/tickets';
const violationDetailsEndpoint = 'http://localhost:8055/items/violation';
const violationChart = ref(null);
const menu = ref(false);
const selectedYear = ref(2024);
const years = ref([2023, 2024]);
const chartInstance = ref(null);
const token = localStorage.getItem('auth-token');

// Reactive object to store violation counts and details
const violationTypes = ref({});
const violationDetails = ref({});


async function fetchViolationDetails() {
    try {
        const response = await axios.get(violationDetailsEndpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        // Create a mapping of violation IDs to violation names
        response.data.data.forEach(violation => {
            violationDetails.value[violation.violation_id] = violation.violation;
        });
    } catch (error) {
        console.error('Error fetching violation details:', error);
    }
}

async function fetchViolationData() {
    menu.value = false;

    try {
        // First, ensure we have violation details
        if (Object.keys(violationDetails.value).length === 0) {
            await fetchViolationDetails();
        }

        const response = await axios.get(violationEndpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                fields: 'date_time,violation_id.violation_type_id.violation_violation_id.violation_id',
            },
        });

        // Reset violation types
        violationTypes.value = {};

        // Process tickets
        response.data.data.forEach(ticket => {
            const date = new Date(ticket.date_time);
            if (date.getFullYear() === selectedYear.value) {
                // Access the nested violation ID
                const violationId = ticket.violation_id.violation_type_id[0].violation_violation_id.violation_id;
                
                if (violationId) {
                    const violationName = violationDetails.value[violationId] || `Violation ${violationId}`;
                    
                    // Increment violation count, initialize if not exists
                    violationTypes.value[violationName] = 
                        (violationTypes.value[violationName] || 0) + 1;
                }
            }
        });

        await nextTick();
        updateViolationChart();
    } catch (error) {
        console.error('Error fetching violation data:', error);
    }
}
function updateViolationChart() {
    if (chartInstance.value) {
        chartInstance.value.destroy();
    }

    // Skip chart creation if no data
    if (Object.keys(violationTypes.value).length === 0) {
        return;
    }

    // Generate color palette dynamically
    const backgroundColors = [
        '#088F8F', '#FF6384', '#36A2EB', 
        '#FFCE56', '#4BC0C0', '#9966FF'
    ];

    const ctx = violationChart.value.getContext('2d');
    chartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(violationTypes.value),
            datasets: [{
                label: 'Number of Violations',
                data: Object.values(violationTypes.value),
                backgroundColor: backgroundColors.slice(0, Object.keys(violationTypes.value).length),
                borderColor: '#088F8F',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Violations in ${selectedYear.value}`,
                    color: '#088F8F',
                    font: { size: 18, weight: 'bold' }
                },
                datalabels: {
                    color: 'white',
                    font: { size: 14, weight: 'bold' },
                    anchor: 'end',
                    align: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#088F8F', 
                        font: { size: 12 } 
                    }
                },
                x: {
                    ticks: { 
                        color: '#088F8F', 
                        font: { size: 12 } 
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

onMounted(() => {
    fetchViolationDetails().then(() => {
        fetchViolationData();
    });
});
</script>
<style scoped>
.chart-container {
    padding: 16px;
    border: 2px solid #088F8F;
    background-color: #f7f7f7;
}

.filter-menu {
    display: block;
    position: relative;
    max-width: 290px;
    left: 0%;
}

.selected-filters {
    color: #088F8F;
    font-weight: bold;
    font-size: 15px;
    margin-left: 20px;
}

.debug-info {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-size: 10px;
}
</style>