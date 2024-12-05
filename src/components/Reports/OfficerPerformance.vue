<template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h2 class="section-title">Officer Performance Report</h2>
    
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="search"
                label="Search Officer"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="selectedMonth"
                :items="months"
                item-title="title"
                item-value="value"
                label="Select Month"
                clearable
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="selectedYear"
                :items="years"
                item-text="year"
                item-value="year"
                label="Select Year"
                clearable
              ></v-select>
            </v-col>
          </v-row>
    

    
          <v-data-table
            :headers="reportHeaders"
            :items="filteredOfficerPerformanceData"
            density="compact"
            class="elevation-1 mt-4"
          ></v-data-table>
          <v-btn color="green" @click="downloadReport">Download Report</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </template>
    
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import * as XLSX from 'xlsx';
    
  const token = localStorage.getItem('auth-token'); // Assuming token is stored in localStorage
  const tickets = ref([]); // Store tickets fetched from Directus
  const search = ref('');
  const selectedMonth = ref(null);
  const selectedYear = ref(null);
    
  // Define month and year options
  const months = [
    { title: 'January', value: '01' },
    { title: 'February', value: '02' },
    { title: 'March', value: '03' },
    { title: 'April', value: '04' },
    { title: 'May', value: '05' },
    { title: 'June', value: '06' },
    { title: 'July', value: '07' },
    { title: 'August', value: '08' },
    { title: 'September', value: '09' },
    { title: 'October', value: '10' },
    { title: 'November', value: '11' },
    { title: 'December', value: '12' },
  ];
    
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { year };
  });
    
  const reportHeaders = [
    { title: "Citation Officer", value: "officer" },
    { title: "Total Tickets Issued", value: "totalTickets" },
    { title: "Paid Tickets", value: "paidTickets" },
    { title: "Not Paid Tickets", value: "notPaidTickets" },
  ];
    
  // Fetch tickets from Directus
  const fetchTickets = async () => {
    try {
      const response = await axios.get("http://localhost:8055/items/tickets", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          fields: "ticket_id,user_created.first_name,user_created.last_name,status,ticket_date",
        },
      });
      tickets.value = response.data.data; // Store the fetched tickets
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };
    
  // Compute the officer performance data
  const officerPerformanceData = computed(() => {
    const officerData = {};
    
    tickets.value.forEach(ticket => {
      const officerName = `${ticket.user_created.first_name} ${ticket.user_created.last_name}`;
      const ticketDate = new Date(ticket.ticket_date);
      const month = String(ticketDate.getMonth() + 1).padStart(2, '0'); // Get month in 'MM' format
      const year = ticketDate.getFullYear();
    
      if (!officerData[officerName]) {
        officerData[officerName] = {
          officer: officerName,
          totalTickets: 0,
          paidTickets: 0,
          notPaidTickets: 0,
        };
      }
    
      officerData[officerName].totalTickets += 1;
      if (ticket.status === 'paid') {
        officerData[officerName].paidTickets += 1;
      } else {
        officerData[officerName].notPaidTickets += 1;
      }
    });
    
    // Convert the officerData object to an array
    return Object.values(officerData);
  });
    
  // Filtered officer performance data based on search and selected month/year
  const filteredOfficerPerformanceData = computed(() => {
    return officerPerformanceData.value.filter(officer => {
      // Filter tickets for the selected officer
      const officerTickets = tickets.value.filter(ticket => {
        const officerName = `${ticket.user_created.first_name} ${ticket.user_created.last_name}`;
        return officerName === officer.officer;
      });
  
      // Check search condition
      const matchesSearch = officer.officer.toLowerCase().includes(search.value.toLowerCase());
      
      // Check month condition
      const matchesMonth = selectedMonth.value 
        ? officerTickets.some(ticket => {
            const ticketDate = new Date(ticket.ticket_date);
            return ticketDate.getMonth() + 1 === parseInt(selectedMonth.value);
          }) 
        : true;
  
      // Check year condition
      const matchesYear = selectedYear.value 
        ? officerTickets.some(ticket => {
            const ticketDate = new Date(ticket.ticket_date);
            return ticketDate.getFullYear() === selectedYear.value;
          }) 
        : true;
  
      return matchesSearch && matchesMonth && matchesYear;
    });
  });
    
  // Function to download the report as an Excel file
  const downloadReport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOfficerPerformanceData.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Officer Performance');
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = 'officer_performance_report.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  // Fetch tickets when the component is mounted
  onMounted(() => {
    fetchTickets();
  });
  </script>
    
  <style scoped>
  .section-title {
    font-size: 1.5rem;
    color: #0F3C45;
    font-weight: bold;
    margin-bottom: 20px;
  }
  </style>