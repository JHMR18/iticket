<template>
    <v-card class="p-4 chart-container" elevation="2">
        <!-- Filter Menu Button -->
        <v-row align="center" justify="start" class="mb-2">
            <span v-if="selectedYear" class="selected-filters">
                <span>Year: {{ selectedYear }}</span>
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
                        <v-btn @click="fetchChartData" color="#088F8F"  class="mt-2" block>
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
                <canvas ref="chart" style="max-width: 100%; height: 400px;"></canvas>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';

// Register all necessary components and plugins
Chart.register(...registerables, ChartDataLabels);

const chartEndpoint = 'http://localhost:8055/items/tickets'; // Adjust this endpoint as needed
const chart = ref(null);
const menu = ref(false);
const selectedYear = ref(2024); // Default to the current year
const years = ref([2023, 2024]); // Adjust this as needed
const chartInstance = ref(null);
const token = localStorage.getItem('auth-token');

async function fetchChartData() {
    menu.value = false;

    try {
        const response = await axios.get(chartEndpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                fields: 'date_time',
            },
        });

        const tickets = response.data.data;
        const monthCounts = Array(12).fill(0); // Initialize an array for 12 months

        // Count tickets per month
        tickets.forEach(ticket => {
            const date = new Date(ticket.date_time);
            if (date.getFullYear() === selectedYear.value) {
                const month = date.getMonth(); // 0-indexed (0 = January, 11 = December)
                monthCounts[month] += 1;
            }
        });

        // Prepare labels and data
        const labels = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const data = monthCounts;

        await nextTick();
        updateChart(labels, data);
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

function updateChart(labels, data) {
    if (chartInstance.value) {
        chartInstance.value.destroy();
    }

    const ctx = chart.value.getContext('2d');
    chartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Tickets Issued',
                data : data,
                borderColor: '#088F8F',
                backgroundColor: '#088F8F',
                fill: true,
                tension: 0.3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Tickets Issued for the Year ' + selectedYear.value,
                    color: '#088F8F',
                    font: {
                        size: 18,
                        weight: 'bold',
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#088F8F',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#088F8F',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    bodyFont: { size: 15 }
                },
                datalabels: {
            color:'white',
            font: {
                size: 14,
                weight: 'bold'
            }
        }
            },
            scales: {
                x: {
                    ticks: { display: true, color: '#088F8F', font: { size: 13 } },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#088F8F', font: { size: 15 } }
                }
            }
        }
    });
}

onMounted(() => {
    fetchChartData();
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
</style>