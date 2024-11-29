<template>
    <v-container>
      <v-row>
        <v-col>
          <v-select
            v-model="selectedReport"
            :items="reportOptions"
            label="Select a Report"
            @change="fetchReportData"
          ></v-select>
        </v-col>
      </v-row>
  
      <v-row v-if="reportData.length > 0">
        <v-col>
          <v-data-table
            :headers="tableHeaders"
            :items="reportData"
            class="elevation-1"
          ></v-data-table>
        </v-col>
      </v-row>
  
      <v-row v-if="reportData.length > 0">
        <v-col>
          <v-btn @click="downloadReport" color="primary">Download as Spreadsheet</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const selectedReport = ref(null);
  const reportOptions = ref([
    { title: 'Sales Report', value: 'sales' },
    { title: 'Inventory Report', value: 'inventory' },
    { title: 'Customer Report', value: 'customers' },
    { title: 'Employee Report', value: 'employees' },
  ]);
  const reportData = ref([]);
  const tableHeaders = ref([]);
  
  const fetchReportData = () => {
    switch (selectedReport.value) {
      case 'sales':
        reportData.value = getSalesData();
        tableHeaders.value = [
          { text: 'Date', value: 'date' },
          { text: 'Amount', value: 'amount' },
          { text: 'Customer', value: 'customer' },
        ];
        break;
      case 'inventory':
        reportData.value = getInventoryData();
        tableHeaders.value = [
          { text: 'Item', value: 'item' },
          { text: 'Quantity', value: 'quantity' },
          { text: 'Location', value: 'location' },
        ];
        break;
      case 'customers':
        reportData.value = getCustomerData();
        tableHeaders.value = [
          { text: 'Name', value: 'name' },
          { text: 'Email', value: 'email' },
          { text: 'Phone', value: 'phone' },
        ];
        break;
      case 'employees':
        reportData.value = getEmployeeData();
        tableHeaders.value = [
          { text: 'Name', value: 'name' },
          { text: 'Position', value: 'position' },
          { text: 'Department', value: 'department' },
        ];
        break;
      default:
        reportData.value = [];
        tableHeaders.value = [];
    }
  };
  
  const getSalesData = () => {
    return [
      { date: '2023-01-01', amount: 200, customer: 'John Doe' },
      { date: '2023-01-02', amount: 300, customer: 'Jane Smith' },
    ];
  };
  
  const getInventoryData = () => {
    return [
      { item: 'Widget A', quantity: 100, location: 'Warehouse 1' },
      { item: 'Widget B', quantity: 50, location: 'Warehouse 2' },
    ];
  };
  
  const getCustomerData = () => {
    return [
      { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' },
    ];
  };
  
  const getEmployeeData = () => {
    return [
      { name: 'Alice Johnson', position: 'Manager', department: 'Sales' },
      { name: 'Bob Brown', position: 'Developer', department: 'IT' },
    ];
  };
  
  const downloadReport = () => {
    const csvContent = convertToCSV(reportData.value);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${selectedReport.value}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    return headers + rows;
  };
  </script>
  
  <style scoped>

  </style>