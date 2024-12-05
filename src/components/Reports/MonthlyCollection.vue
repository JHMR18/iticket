<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <span class="headline">Monthly Collection Report</span>
              <v-spacer></v-spacer>
            </v-card-title>
  
            <v-row class="mb-4">
              <v-col cols="12" sm="4">
                <v-select
                  v-model="selectedYear"
                  :items="years"
                  label="Select Year"
                  clearable
                  @change="fetchReport"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4">
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  label="Select Ticket Status"
                  clearable
                  @change="fetchReport"
                ></v-select>
              </v-col>
            </v-row>
  
            <v-data-table
              :headers="headers"
              :items="filteredCollectionReport"
              dense
              class="elevation-1"
            >
            </v-data-table>
          </v-card>
          <v-btn @click="downloadExcel" color="success" class="ml-2">Download Report</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import * as XLSX from 'xlsx'; // Import the xlsx library
  
  const token = localStorage.getItem("auth-token");
  const selectedYear = ref(2024); // Set default year to 2024
  const statusFilter = ref(''); // Initialize status filter
  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => new Date().getFullYear() - i);
  const statusOptions = ['paid', 'not paid'];
  
  const headers = [
    { title: "Month", value: "month" },
    { title: "Total Tickets", value: "total_tickets" },
    { title: "Total Amount", value: "total_amount" },
  ];
  
  const collectionReport = ref([]);
  
  const fetchReport = async () => {
    try {
      const response = await axios.get("http://localhost:8055/items/tickets", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          fields: "date_time,total_penalty_fee,status",
        },
      });
  
      collectionReport.value = response.data.data.map(ticket => ({
        date_time: new Date(ticket.date_time),
        total_penalty_fee: ticket.total_penalty_fee,
        status: ticket.status,
      }));
    } catch (error) {
      console.error("Error fetching collection report:", error);
    }
  };
  
  const filteredCollectionReport = computed(() => {
    const filtered = collectionReport.value.filter(ticket => {
      const ticketDate = ticket.date_time;
      const matchesYear = ticketDate.getFullYear() === selectedYear.value;
      const matchesStatus = !statusFilter.value || ticket.status === statusFilter.value;
  
      return matchesYear && matchesStatus;
    });
  
    const monthlyData = {};
    filtered.forEach(ticket => {
      const monthKey = ticket.date_time.toLocaleString('default', { month: 'long' });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total_tickets: 0, total_amount: 0 };
      }
      monthlyData[monthKey].total_tickets += 1;
      monthlyData[monthKey].total_amount += ticket.total_penalty_fee;
    });
  
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total_tickets: data.total_tickets,
      total_amount: data.total_amount,
    }));
  });
  
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCollectionReport.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Collection Report");
  
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "monthly_collection_report.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Fetch report when the component is mounted
  onMounted(fetchReport);
  </script>
  
  <style scoped>
  .headline {
    color: #0F3C45;
    font-size: 1.5rem;
    font-weight: bold;
  }
  </style>