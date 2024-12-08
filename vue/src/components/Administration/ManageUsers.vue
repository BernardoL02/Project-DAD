<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'

const columns = ['Id', 'Name', 'Email', 'NickName', 'Type', 'Action']
const adminStore = useAdminStore()

onMounted(() => {
  adminStore.getUsers()
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 space-y-6">
    <div class="pt-8">
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>
      <div v-else>
        <PaginatedTable
          :columns="columns"
          :data="adminStore.users"
          :pagination="true"
          :showActions="true"
        />
        <div v-if="!loading && adminStore.users.length == 0" class="text-center text-gray-400 mt-4">
          No users available
        </div>
      </div>
    </div>
  </div>
</template>
