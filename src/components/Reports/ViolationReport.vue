<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <span class="headline">Violation Report</span>
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
                  v-model="selectedMonth"
                  :items="months"
                  item-title="title"
                  item-value="value"
                  label="Select Month"
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
              :items="filteredViolationReport"
              dense
              class="elevation-1"
            >
              <template v-slot:top>

              </template>
            </v-data-table>
          </v-card>
        </v-col>
        <v-btn @click="downloadExcel" color="success" class="ml-2">Download Excel</v-btn>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import * as XLSX from 'xlsx'; // Import the xlsx library
  
  const token = localStorage.getItem("auth-token");
  const violationReport = ref([]);
  const selectedYear = ref(null);
  const selectedMonth = ref(null);
  const statusFilter = ref('');
  const years = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => new Date().getFullYear() - i);
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
  const statusOptions = ['paid', 'not paid'];
  
  const headers = [
    { title: "Ticket ID", value: "ticket_id" },
    { title: "First Name", value: "first_name" },
    { title: "Middle Name", value: "middle_name" },
    { title: "Last Name", value: "last_name" },
    { title: "Violation", value: "violation" },
    { title: "Date Issued", value: "date_issued" },
    { title: "Citation Officer", value: "citation_officer" },
    { title: "Penalty Fee", value: "penalty_fee" },
    { title: "Ticket Status", value: "ticket_status" },
  ];
  
  const fetchReport = async () => {
    try {
      const response = await axios.get("http://localhost:8055/items/tickets", {
   headers: { Authorization: `Bearer ${token}` },
        params: {
          fields: "ticket_id,violator_id.first_name,violator_id.middle_name,violator_id.last_name,violation_id.violation_violation_id.violation,date_time,user_created.first_name,user_created.last_name,total_penalty_fee,status",
        },
      });
  
      violationReport.value = response.data.data.map(ticket => ({
        ticket_id: ticket.ticket_id,
        first_name: ticket.violator_id.first_name,
        middle_name: ticket.violator_id.middle_name,
        last_name: ticket.violator_id.last_name,
        violation: ticket.violation_id.map(v => v.violation_violation_id.violation).join(', '),
        date_issued: new Date(ticket.date_time).toLocaleString(),
        citation_officer: `${ticket.user_created.first_name} ${ticket.user_created.last_name}`,
        penalty_fee: ticket.total_penalty_fee,
        ticket_status: ticket.status,
      }));
    } catch (error) {
      console.error("Error fetching violation report:", error);
    }
  };
  
  const filteredViolationReport = computed(() => {
    return violationReport.value.filter(ticket => {
      const ticketDate = new Date(ticket.date_issued);
      const matchesYear = !selectedYear.value || ticketDate.getFullYear() === selectedYear.value;
      const matchesMonth = selectedMonth.value === null || ticketDate.getMonth() === selectedMonth.value;
      const matchesStatus = !statusFilter.value || ticket.ticket_status === statusFilter.value;
  
      return matchesYear && matchesMonth && matchesStatus;
    });
  });
  
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredViolationReport.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Violation Report");
  
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "violation_report.xlsx");
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