<script setup>
import { ref,onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useProfileStore } from '@/stores/profile';


const profileStore = useProfileStore();
const userStore = useUserStore();

onMounted(async () => {
  if (!userStore.userProfile && !profileStore.loading) {
    await profileStore.fetchProfile(); 
  }
});

const updatedName = ref(profileStore.name);
const updatedEmail = ref(profileStore.email);
const updatedNickname = ref(profileStore.nickname);
const updatedAvatar = ref(null);
const responseMessage = ref('');


const resetFormFields = () => {
  updatedName.value = userStore.name;
  updatedEmail.value = userStore.email;
  updatedNickname.value = userStore.nickname;
  updatedAvatar.value = null;
};

const updateUserInfo = async () => {
  const updatedData = {
    name: updatedName.value,
    email: updatedEmail.value,
    nickname: updatedNickname.value,
    photo: updatedAvatar.value ? updatedAvatar.value : userStore.userProfile?.photo,
  };

  userStore.loading = true;
  responseMessage.value = '';

  try {
    await userStore.updateUserProfile(updatedData); // Call store's method to update profile
    responseMessage.value = 'Your information has been updated successfully!';
    resetFormFields(); // Reset form after successful update
  } catch (err) {
    responseMessage.value = 'Failed to update information. Please try again.';
    
    console.error('Update error:', err);
  } finally {
    userStore.loading = false;
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto py-10 px-6 space-y-8">
    <h1 class="text-2xl font-bold text-center">Update Your Information</h1>

    <form @submit.prevent="updateUserInfo" class="space-y-6">
      <!-- Name Input -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-600 mb-2">Name</label>
        <input
          id="name"
          v-model="updatedName"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Email Input -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-600 mb-2">Email</label>
        <input
          id="email"
          v-model="updatedEmail"
          type="email"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Nickname Input -->
      <div>
        <label for="nickname" class="block text-sm font-medium text-gray-600 mb-2">Nickname</label>
        <input
          id="nickname"
          v-model="updatedNickname"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Avatar Upload -->
      <div>
        <label for="avatar" class="block text-sm font-medium text-gray-600 mb-2">Avatar</label>
        <input
          id="avatar"
          type="file"
          @change="e => updatedAvatar.value = e.target.files[0]"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          :disabled="userStore.loading"
          class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          Update Profile
        </button>
      </div>
    </form>

    <!-- Response Message -->
    <div v-if="responseMessage" class="mt-4 text-center">
      <p :class="responseMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'">
        {{ responseMessage }}
      </p>
    </div>
  </div>
</template>
