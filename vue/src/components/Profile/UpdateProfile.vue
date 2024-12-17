<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const avatar = ref(null)
const uploadButton = ref(true)

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]

  if (file) {
    uploadButton.value = false
    updatedAvatar.value = file
    avatar.value = URL.createObjectURL(file)
  }
}

const updatedName = ref(authStore.name)
const updatedEmail = ref(authStore.email)
const updatedNickname = ref(authStore.nickname)
const updatedAvatar = ref(null)
const fileInput = ref(null)

const updateUserInfo = async () => {
  const updatedData = new FormData()

  updatedData.append('name', updatedName.value)
  updatedData.append('email', updatedEmail.value)
  updatedData.append('nickname', updatedNickname.value)

  if (updatedAvatar.value) {
    updatedData.append('photo_filename', updatedAvatar.value)
  }

  await authStore.updateUserInfo(updatedData)
  await authStore.fetchProfile()
}

const triggerFileInput = () => {
  fileInput.value.click()
}
</script>

<template>
  <div class="flex items-center justify-center mt-14">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
      <div class="space-y-4">
        <h1 class="text-2xl font-bold text-center">Update Your Information</h1>

        <form @submit.prevent="updateUserInfo">
          <div class="space-y-6 pt-6">
            <!-- Name Input -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-600 mb-2">Name</label>
              <input
                id="name"
                v-model="updatedName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <!-- Email Input -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <input
                id="email"
                v-model="updatedEmail"
                type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <!-- Nickname Input -->
            <div>
              <label for="nickname" class="block text-sm font-medium text-gray-600 mb-2"
                >Nickname</label
              >
              <input
                id="nickname"
                v-model="updatedNickname"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <!-- Avatar Upload -->
            <div class="mb-4">
              <label for="avatar" class="block text-sm font-medium text-gray-600 mb-2">
                Photo
              </label>

              <!-- Custom File Input -->
              <div v-show="uploadButton" class="flex items-center justify-left w-full">
                <label
                  for="avatar"
                  class="flex flex-col items-center bg-sky-500 text-white rounded-lg shadow-lg px-4 py-2 cursor-pointer hover:bg-sky-600 transition-colors"
                >
                  <span class="text-xs">Choose a File</span>
                  <!-- Input oculto -->
                  <input
                    type="file"
                    id="avatar"
                    @change="handlePhotoUpload"
                    accept=".png, .jpeg, .jpg"
                    class="form-control w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hidden"
                  />
                </label>
              </div>

              <div v-show="avatar" class="flex justify-start">
                <span>
                  <!-- O input é oculto, mas é clicado ao clicar na imagem -->
                  <input
                    type="file"
                    id="avatar"
                    @change="handlePhotoUpload"
                    accept=".png, .jpeg, .jpg"
                    class="form-control w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hidden"
                    ref="fileInput"
                  />

                  <!-- Imagem de avatar que é clicável -->
                  <img
                    :src="avatar"
                    alt="User Profile Picture"
                    class="w-28 h-28 border-4 border-white rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                    @click="triggerFileInput"
                  />
                </span>
              </div>
            </div>
          </div>
          <!-- Submit Button -->
          <div class="pt-10">
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition focus:ring-4 focus:ring-gray-400 focus:outline-none"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
