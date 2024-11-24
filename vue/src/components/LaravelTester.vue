<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';

const authStore = useAuthStore();
const userStore = useUserStore();

const activeTab = ref('login');
const email = ref('');
const name = ref('');
const password = ref('');
const nickname = ref('');
const responseData = ref('');
const avatarFile = ref(null);

const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        avatarFile.value = file;
    }
};

const submitLogin = async () => {
    const user = await authStore.login({
        email: email.value,
        password: password.value,
    });
    responseData.value = `Hello, ${user.data.name}!`;
};

const submitRegister = async () => {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('email', email.value);
    formData.append('nickname', nickname.value);
    formData.append('password', password.value);
    
    if (avatarFile.value) {
        formData.append('photo_filename', avatarFile.value); // Ensure this is the correct field name for your API
    }

    try {
        const newUser = await userStore.register(formData); // Call the register method from the store
        if (newUser) {
            responseData.value = `User ${newUser.data.nickname} registered successfully!`;
        }
    } catch (error) {
        if (error.response && error.response.data) {
            // Handle validation errors
            responseData.value = error.response.data.errors
                ? Object.values(error.response.data.errors).join(', ')
                : "Registration failed. Please try again.";
        } else {
            console.error('Registration failed:', error); // Log detailed error response for debugging
            responseData.value = "Registration failed. Please try again.";
        }
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <!-- Tab Navigation -->
            <div class="flex justify-between border-b-2 border-gray-200 mb-6">
                <button
                    :class="[
                        'w-1/2 py-2 text-center text-lg font-bold transition',
                        activeTab === 'login'
                            ? 'text-blue-500 border-b-4 border-blue-500'
                            : 'text-gray-500',
                    ]"
                    @click="activeTab = 'login'"
                >
                    Login
                </button>
                <button
                    :class="[
                        'w-1/2 py-2 text-center text-lg font-bold transition',
                        activeTab === 'register'
                            ? 'text-blue-500 border-b-4 border-blue-500'
                            : 'text-gray-500',
                    ]"
                    @click="activeTab = 'register'"
                >
                    Register
                </button>
            </div>

            <!-- Login Form -->
            <div v-if="activeTab === 'login'" class="space-y-4">
                <h2 class="text-2xl font-bold text-center text-blue-700">Account Login</h2>
                <form @submit.prevent="submitLogin" class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-600 mb-1">
                            Email:
                        </label>
                        <input
                            type="text"
                            id="email"
                            v-model="email"
                            placeholder="Enter your email"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-600 mb-1">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            v-model="password"
                            placeholder="Enter your password"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Log In
                    </button>
                </form>

                <div v-if="responseData" class="mt-4 text-center text-gray-700">
                    <p>{{ responseData }}</p>
                </div>
            </div>

            <!-- Register Form -->
            <div v-if="activeTab === 'register'" class="space-y-4">
                <h2 class="text-2xl font-bold text-center text-blue-700">Create an Account</h2>
                <form @submit.prevent="submitRegister" class="space-y-4">
                    <div>
                        <label for="register-name" class="block text-sm font-medium text-gray-600 mb-1">
                            Name:
                        </label>
                        <input
                            type="text"
                            id="register-name"
                            v-model="name"
                            placeholder="Enter your name"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="register-email" class="block text-sm font-medium text-gray-600 mb-1">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="register-email"
                            v-model="email"
                            placeholder="Enter your email"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="nickname" class="block text-sm font-medium text-gray-600 mb-1">
                            Nickname:
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            v-model="nickname"
                            placeholder="Enter your nickname"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="register-password" class="block text-sm font-medium text-gray-600 mb-1">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="register-password"
                            v-model="password"
                            placeholder="Create a password"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="avatar" class="block text-sm font-medium text-gray-600 mb-1">
                            Avatar:
                        </label>
                        <input
                            type="file"
                            id="avatar"
                            @change="handleAvatarUpload"
                            class="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        Register
                    </button>
                </form>

                <div v-if="responseData" class="mt-4 text-center text-gray-700">
                    <p>{{ responseData }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
