<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import PaginatedTable from '@/components/ui/table/StandardActionsTable.vue'

const columns = ['Id', 'Name', 'Email', 'NickName', 'Type']

// Admin store
const adminStore = useAdminStore()
const loading = ref(false)

// Methods for user actions
const blockUser = async (nickname) => {
  if (confirm(`Are you sure you want to block ${nickname}?`)) {
    loading.value = true
    await adminStore.blockUser(nickname)
    loading.value = false
  }
}

const deleteUser = async (nickname) => {
  if (confirm(`Are you sure you want to delete ${nickname}? This action cannot be undone.`)) {
    loading.value = false
  }
  loading.value = true
  await adminStore.deleteUser(nickname)
}

onMounted(async () => {
  loading.value = true
  await adminStore.getUsers()
  loading.value = false
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 space-y-6">
    <!-- Page Header -->
    <h1 class="text-2xl font-semibold text-gray-700 text-center">User Management</h1>
    <div>
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>

      <!-- Paginated Table -->
      <div v-else>
        <PaginatedTable
          :columns="columns"
          :data="adminStore.users"
          :hidden-columns="[]"
          :pagination="true"
        >
          <!-- Action Slot -->
          <template #actions="{ row }">
            <div class="flex space-x-2">
              <button @click="blockUser(row.NickName)">
                <!-- Icon -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="25"
                  height="25"
                  viewBox="0 0 48 48"
                >
                  <linearGradient
                    id="GCWVriy4rQhfclYQVzRmda_hRIvjOSQ8I0i_gr1"
                    x1="9.812"
                    x2="38.361"
                    y1="9.812"
                    y2="38.361"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stop-color="#f44f5a"></stop>
                    <stop offset=".443" stop-color="#ee3d4a"></stop>
                    <stop offset="1" stop-color="#e52030"></stop>
                  </linearGradient>
                  <path
                    fill="url(#GCWVriy4rQhfclYQVzRmda_hRIvjOSQ8I0i_gr1)"
                    d="M24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,12.955,35.045,4,24,4z M24,38	c-7.732,0-14-6.268-14-14s6.268-14,14-14s14,6.268,14,14S31.732,38,24,38z"
                  ></path>
                  <linearGradient
                    id="GCWVriy4rQhfclYQVzRmdb_hRIvjOSQ8I0i_gr2"
                    x1="6.821"
                    x2="41.08"
                    y1="6.321"
                    y2="40.58"
                    gradientTransform="translate(-.146 .354)"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stop-color="#f44f5a"></stop>
                    <stop offset=".443" stop-color="#ee3d4a"></stop>
                    <stop offset="1" stop-color="#e52030"></stop>
                  </linearGradient>
                  <polygon
                    fill="url(#GCWVriy4rQhfclYQVzRmdb_hRIvjOSQ8I0i_gr2)"
                    points="13.371,38.871 9.129,34.629 34.629,9.129 38.871,13.371"
                  ></polygon>
                </svg>
                <!-- Text -->
                {{ isBlocked ? 'Unblock' : 'Block' }}
              </button>
              <button
                class="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                @click="deleteUser(row.NickName)"
              >
                Delete
              </button>
            </div>
          </template>
        </PaginatedTable>

        <!-- Empty State -->
        <div
          v-if="!loading && adminStore.users.length === 0"
          class="text-center text-gray-400 mt-4"
        >
          No users available.
        </div>
      </div>
    </div>
  </div>
</template>
