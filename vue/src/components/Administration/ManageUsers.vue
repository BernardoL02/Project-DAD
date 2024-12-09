<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import PaginatedTable from '@/components/ui/table/StandardActionsTable.vue'
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue'

const columns = ['Id', 'Name', 'Email', 'NickName', 'Type']
const adminStore = useAdminStore()
const authStore = useAuthStore()
const loading = ref(false)
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const actionType = ref('')
const targetNickname = ref('')
const showRegisterModal = ref(false) // Controle do modal de registro

// Estado para o formulário de registro
const name = ref('')
const email = ref('')
const nickname = ref('')
const password = ref('')
const avatar = ref(null)
const updatedAvatar = ref(null)
const uploadButton = ref(true)

const openModal = (type, nickname) => {
  actionType.value = type
  targetNickname.value = nickname
  modalTitle.value =
    type === 'block' ? `Block User` : type === 'unblock' ? `Unblock User` : `Delete User`
  modalMessage.value =
    type === 'delete'
      ? `Are you sure you want to delete ${nickname}? This action cannot be undone.`
      : `Are you sure you want to ${type} ${nickname}?`
  showModal.value = true
}
const handleCancel = () => {
  showModal.value = false
}

const handleConfirm = async () => {
  loading.value = true
  if (actionType.value === 'block') {
    await adminStore.blockUser(targetNickname.value)
  } else if (actionType.value === 'unblock') {
    await adminStore.unblockUser(targetNickname.value)
  } else if (actionType.value === 'delete') {
    await adminStore.deleteUser(targetNickname.value)
  }
  loading.value = false
  showModal.value = false
}

// Função para abrir o modal de registro
const openRegisterModal = () => {
  showRegisterModal.value = true
}

// Função para fechar o modal de registro
const closeRegisterModal = () => {
  showRegisterModal.value = false
}

// Função para lidar com upload de foto
const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadButton.value = false
    updatedAvatar.value = file
    avatar.value = URL.createObjectURL(file)
  }
}

// Função para submeter o registro
const submitRegister = async () => {
  const formData = new FormData()
  formData.append('name', name.value)
  formData.append('email', email.value)
  formData.append('nickname', nickname.value)
  formData.append('password', password.value)

  if (updatedAvatar.value) {
    formData.append('photo_filename', updatedAvatar.value)
  }

  await adminStore.register(formData)
  closeRegisterModal()
  await adminStore.getUsers() // Atualizar a lista de usuários
}

onMounted(async () => {
  loading.value = true
  authStore.fetchProfile()
  await adminStore.getUsers()
  loading.value = false
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 space-y-6">
    <h1 class="text-2xl font-semibold text-gray-700 text-center">User Management</h1>
    <button @click="openRegisterModal" class="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
      Register Admin
    </button>
    <div>
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>

      <div v-else>
        <PaginatedTable :columns="columns" :data="adminStore.users" :hidden-columns="['Blocked']" :pagination="true">
          <template #actions="{ row }">
            <div class="flex space-x-2">
              <button v-if="!row.Blocked" @click="openModal('block', row.NickName)">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"
                  height="25" width="25" version="1.1" id="Layer_1" viewBox="0 0 330 330" xml:space="preserve">
                  <g id="XMLID_516_">
                    <path id="XMLID_517_"
                      d="M15,160c8.284,0,15-6.716,15-15V85c0-30.327,24.673-55,55-55c30.327,0,55,24.673,55,55v45h-25   c-8.284,0-15,6.716-15,15v170c0,8.284,6.716,15,15,15h200c8.284,0,15-6.716,15-15V145c0-8.284-6.716-15-15-15H170V85   c0-46.869-38.131-85-85-85S0,38.131,0,85v60C0,153.284,6.716,160,15,160z" />
                  </g>
                </svg>
              </button>

              <button v-else @click="openModal('unblock', row.NickName)">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"
                  height="25" width="25" version="1.1" id="Layer_1" viewBox="0 0 330 330" xml:space="preserve">
                  <g id="XMLID_518_">
                    <path id="XMLID_519_"
                      d="M65,330h200c8.284,0,15-6.716,15-15V145c0-8.284-6.716-15-15-15h-15V85c0-46.869-38.131-85-85-85   S80.001,38.131,80.001,85v45H65c-8.284,0-15,6.716-15,15v170C50,323.284,56.716,330,65,330z M110.001,85   c0-30.327,24.673-55,54.999-55c30.327,0,55,24.673,55,55v45H110.001V85z" />
                  </g>
                </svg>
              </button>
              <button v-if="authStore.nickname != row.NickName" @click="openModal('delete', row.NickName)">
                <svg class="hover:stroke-2 w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke-width="1" stroke="red">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </template>
        </PaginatedTable>

        <div v-if="!loading && adminStore.users.length === 0" class="text-center text-gray-400 mt-4">
          No users available.
        </div>
      </div>
      <ConfirmationModal :visible="showModal" :title="modalTitle" :message="modalMessage" @confirm="handleConfirm"
        @cancel="handleCancel" />
    </div>
  </div>

  <div v-if="showRegisterModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 relative">
      <button @click="closeRegisterModal" class="absolute top-4 right-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-black hover:text-gray-700" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>


      <div class="space-y-4">
        <h2 class="text-2xl font-bold text-center text-gray-800">Register Admin</h2>
        <form @submit.prevent="submitRegister" class="space-y-4">
          <div>
            <label for="register-name" class="block text-sm font-medium text-gray-600 mb-1">
              Name
            </label>
            <input type="name" id="register-name" v-model="name" placeholder="Enter your name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>

          <div>
            <label for="register-email" class="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input type="email" id="register-email" v-model="email" placeholder="Enter your email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>

          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-600 mb-1">
              Nickname
            </label>
            <input type="text" id="nickname" v-model="nickname" placeholder="Enter your nickname"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>

          <div>
            <label for="register-password" class="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input type="password" id="register-password" v-model="password" placeholder="Create a password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </div>

          <div class="mb-4">
            <label for="avatar" class="block text-sm font-medium text-gray-600 mb-2"> Photo </label>

            <!-- Custom File Input -->
            <div v-show="uploadButton" class="flex items-center justify-left w-full">
              <label for="avatar"
                class="flex flex-col items-center bg-sky-500 text-white rounded-lg shadow-lg px-4 py-2 cursor-pointer hover:bg-sky-600 transition-colors">
                <span class="text-xs">Choose a File</span>
                <!-- Input oculto -->
                <input type="file" id="avatar" @change="handlePhotoUpload" accept=".png, .jpeg, .jpg"
                  class="form-control w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hidden" />
              </label>
            </div>

            <div v-show="avatar" class="flex justify-start">
              <img :src="avatar" alt="User Profile Picture"
                class="w-28 h-28 border-4 border-white rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl" />
            </div>
          </div>

          <div class="pt-4">
            <button type="submit"
              class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition focus:ring-4 focus:ring-gray-400 focus:outline-none">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

</template>
