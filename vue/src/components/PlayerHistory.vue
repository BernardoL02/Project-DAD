<script setup>
import DynamicTable from '@/components/StandardTable.vue';

const tableColumns = ['Name', 'Age', 'Email']; // Columns for the table
const tableData = [
  { Name: 'John Doe', Age: 28, Email: 'johndoe@example.com' },
  { Name: 'Jane Smith', Age: 32, Email: 'janesmith@example.com' },
  { Name: 'Sam Brown', Age: 45, Email: 'sambrown@example.com' },
]; 

</script>

<template>

<div class="max-w-4xl mx-auto mt-10">
    <DynamicTable :columns="tableColumns" :data="tableData" />
</div>
</template>