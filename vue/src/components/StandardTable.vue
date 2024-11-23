<script setup>
defineProps({
  // Array of column names
  columns: {
    type: Array,
    required: true,
  },
  // Array of data rows, where each row is an object
  data: {
    type: Array,
    required: true,
  },
});
</script>
<template>
    <div class="overflow-x-auto shadow-md rounded-lg">
      <table class="min-w-full text-sm text-left text-gray-600">
        <thead class="bg-gray-100 text-gray-800">
          <tr>
            <th 
              v-for="(column, index) in columns"
              :key="'header-' + index"
              class="py-3 px-4 font-medium"
            >
              {{ column }}
            </th>
          </tr>
        </thead>
        
        <tbody>
          <tr 
            v-for="(row, rowIndex) in data"
            :key="'row-' + rowIndex"
            class="border-t hover:bg-gray-50"
          >
            <td 
              v-for="(column, colIndex) in columns"
              :key="'cell-' + rowIndex + '-' + colIndex"
              class="py-3 px-4"
            >
              {{ row[column] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
