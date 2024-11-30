<script setup>
import { ref, onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';

const profileStore = useProfileStore();

onMounted(async () => {
  if (!profileStore.loading) {
    await profileStore.fetchProfile();
  }
});

const handlePhotoUpload = (event) => {
  const file = event.target.files[0];

  if (file) {
    updatedAvatar.value = file;
  }
};

const updatedName = ref(profileStore.name);
const updatedEmail = ref(profileStore.email);
const updatedNickname = ref(profileStore.nickname);
const updatedAvatar = ref(null);

const updateUserInfo = async () => {
  const updatedData = {
    name: updatedName.value,
    email: updatedEmail.value,
    nickname: updatedNickname.value,
    photo_filename: updatedAvatar.value ? updatedAvatar.value.name : profileStore.photo_filename,
  };

  await profileStore.updateUserInfo(updatedData);
};

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
              <input id="name" v-model="updatedName" type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>

            <!-- Email Input -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <input id="email" v-model="updatedEmail" type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>

            <!-- Nickname Input -->
            <div>
              <label for="nickname" class="block text-sm font-medium text-gray-600 mb-2">Nickname</label>
              <input id="nickname" v-model="updatedNickname" type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>

            <!-- Avatar Upload -->
            <div class="mb-4">
              <label for="avatar" class="block text-sm font-medium text-gray-600 mb-2">
                Photo
              </label>

              <!-- Custom File Input -->
              <div class="flex items-center justify-left w-full">
                <label for="avatar"
                  class="flex flex-col items-center bg-sky-500 text-white rounded-lg shadow-lg px-4 py-2 cursor-pointer hover:bg-sky-600 transition-colors">
                  <span class="text-xs">Choose a File</span>
                  <!-- Input oculto -->
                  <input type="file" name="photo_filename" @change="handlePhotoUpload" id="avatar"
                    style="display: none;">
                </label>
              </div>
            </div>
          </div>
          <!-- Submit Button -->
          <div class="pt-10">
            <button type="submit" :disabled="profileStore.loading"
              class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition focus:ring-4 focus:ring-gray-400 focus:outline-none">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
