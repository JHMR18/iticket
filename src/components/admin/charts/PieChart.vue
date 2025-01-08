<template>
    <v-card class="p-4 chart-container" elevation="2">
        <!-- Filter Menu Button -->
        <v-row align="center" justify="start" class="mb-2">
            <span>
            <span style="color: #088F8F; font-weight: bold; font-size: 15px;margin-left: 20px;margin-top: 20px">Year: {{ selectedYear }}</span>
            </span>
            <v-menu
                v-model="menu"
                activator="parent"
                offset-y
                :close-on-content-click="false"
            >
                <template #activator="{ props }">
                    <v-btn
                        color="#088F8F"
                        v-bind="props"
                        class="mb-2"
                        variant="text"
                    >
                        <v-icon color="#088F8F">mdi-filter-variant</v-icon>
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
                        <v-btn @click="fetchChartData" color="#088F8F" class="mt-2" block>
                            Apply Filter
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-row>

        <v-divider></v-divider>

        <!-- Chart Canvas -->
        <v-row>
            <v-col>
                <canvas class="pie-chart" ref="chart" style="max-width: 100%; height: 410px;"></canvas>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { Chart } from 'chart.js/auto';
import axios from 'axios';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

const token = localStorage.getItem('auth-token');
const chart = ref(null);
const menu = ref(false);  // Controls the visibility of the filter menu
const currentYear = 2024; // Get the current year
const selectedYear = ref(currentYear); // Holds the selected year for filtering, initialized with the current year
const years = ref([2021, 2022, 2023, currentYear]); // Sample years including the current year
const chartInstance = ref(null);

async function fetchChartData() {
    menu.value = false;

    try {
        const response = await axios.get("http://localhost:8055/items/tickets", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                fields: "status,date_time"
            }
        });

        const tickets = response.data.data;

        // Calculate the distribution of paid vs not paid tickets for the selected year
        const statusCounts = {
            paid: 0,
            "not paid": 0
        };

        tickets.forEach(ticket => {
            const ticketYear = new Date(ticket.date_time).getFullYear();
            if (selectedYear.value && ticketYear === selectedYear.value) {
                // Categorize tickets as either 'paid' or 'not paid'
                if (ticket.status === 'paid') {
                    statusCounts['paid']++;
                } else {
                    statusCounts['not paid']++;
                }
            }
        });

        // Filter out categories with a count of zero
        const filteredLabels = Object.keys(statusCounts).filter(status => statusCounts[status] > 0);
        const filteredData = filteredLabels.map(label => statusCounts[label]);

        await nextTick();
        updateChart(filteredLabels, filteredData);
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
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ticket Payment Status',
                data: data,
                backgroundColor: [
                    '#088F8F', // Paid
                    '#6e93d6'  // Not Paid
                ],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Ticket Payment Status Distribution for Selected Year',
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
                    backgroundColor: '#fff',
                    titleColor: '#088F8F',
                    bodyColor: '#088F8F',
                    bodyFont: { size: 15 }
                },
                datalabels: {
                    borderRadius: 5,
                    backgroundColor: '#088F8F', 
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    formatter: (value, ctx) => {
                        let percentage = (value / ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0) * 100).toFixed(1);
                        return `${ctx.chart.data.labels[ctx.dataIndex]}: ${percentage}%`;
                    }
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

.pie-chart {
    padding: 10px;
}

.filter-menu {
    display: block;
    position: relative;
    max-width: 290px;
    left: 50%;
}

.selected-filters {
    font-size: 15px;
    font-weight: bold;
    margin-left: 20px;
}
</style>