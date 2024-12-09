<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const name = ref('')
const password = ref('')
const nickname = ref('')
const responseData = ref('')
const updatedAvatar = ref(null)

const avatar = ref(null)
const uploadButton = ref(true)
const fileInput = ref(null);

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]

  if (file) {
    uploadButton.value = false
    updatedAvatar.value = file
    avatar.value = URL.createObjectURL(file)
  }
}

const submitRegister = async () => {
  const formData = new FormData()
  formData.append('name', name.value)
  formData.append('email', email.value)
  formData.append('nickname', nickname.value)
  formData.append('password', password.value)

  if (updatedAvatar.value) {
    formData.append('photo_filename', updatedAvatar.value)
  }

  const newUser = await authStore.register(formData)

  if (newUser) {
    router.push('/login')
  }
}

const triggerFileInput = () => {
  fileInput.value.click();
};

</script>

<template>
  <div class="flex items-center justify-center mt-14">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
      <div class="space-y-4">
        <h2 class="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
        <form @submit.prevent="handleRegister" class="space-y-4">
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
              <span>
                <input type="file" id="avatar" @change="handlePhotoUpload" accept=".png, .jpeg, .jpg"
                  class="form-control w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hidden"
                  ref="fileInput" />

                <img :src="avatar" alt="User Profile Picture"
                  class="w-28 h-28 border-4 border-white rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                  @click="triggerFileInput" />
              </span>
            </div>
          </div>

          <div class="pt-4">
            <button @click.prevent="submitRegister"
              class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition focus:ring-4 focus:ring-gray-400 focus:outline-none">
              Register
            </button>
          </div>
        </form>

        <div class="mt-4 text-center">
          <RouterLink to="login" class="text-gray-700 hover:underline text-sm"> Login </RouterLink>
        </div>

        <div v-if="responseData" class="mt-4 text-center text-gray-700">
          <p>{{ responseData }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
