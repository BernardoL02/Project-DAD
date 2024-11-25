<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import axios from 'axios'

const userStore = useUserStore();

const updatedName = ref(userStore.name);
const updatedEmail = ref(userStore.email);
const updatedNickname = ref(userStore.nickname);
const responseMessage = ref('');
const loading = ref(false);

const updateUserInfo = async () => {
    const updatedData = {
        name: updatedName.value,
        email: updatedEmail.value,
        nickname: updatedNickname.value,
    };

    loading.value = true;
    responseMessage.value = '';

    try {
        const response = await axios.put('/users/me', updatedData); // API call to update user info
        userStore.userProfile = response.data.data; // Update the store with the latest info
        responseMessage.value = 'Your information has been updated successfully!';
    } catch (err) {
        responseMessage.value = 'Failed to update information. Please try again.';
        console.error('Update error:', err);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="max-w-2xl mx-auto py-10 px-6 space-y-8 ">
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

            <!-- Submit Button -->
            <div>
                <button
                    type="submit"
                    :disabled="loading"
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
