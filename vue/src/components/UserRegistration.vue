<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();


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

const submitRegister = async () => {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('email', email.value);
    formData.append('nickname', nickname.value);
    formData.append('password', password.value);
    if (avatarFile.value) {
        formData.append('photo_filename', avatarFile.value.name);
    }

    try {
        const newUser = await userStore.register(formData);
        if (newUser) {
            responseData.value = `User ${newUser.data.nickname} registered successfully!`;
            router.push('/login');
        }
    } catch (error) {
        console.error('Registration failed:', error);
    }
};

</script>

<template>
    <div class="flex items-center justify-center mt-14">
        <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <div class="space-y-4">
                <h2 class="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div>
                        <label for="register-name" class="block text-sm font-medium text-gray-600 mb-1">
                            Name
                        </label>
                        <input type="name" id="register-name" v-model="name" placeholder="Enter your name"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label for="register-email" class="block text-sm font-medium text-gray-600 mb-1">
                            Email
                        </label>
                        <input type="email" id="register-email" v-model="email" placeholder="Enter your email"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label for="nickname" class="block text-sm font-medium text-gray-600 mb-1">
                            Nickname
                        </label>
                        <input type="text" id="nickname" v-model="nickname" placeholder="Enter your nickname"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label for="register-password" class="block text-sm font-medium text-gray-600 mb-1">
                            Password
                        </label>
                        <input type="password" id="register-password" v-model="password" placeholder="Create a password"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div class="mb-4">
                        <label for="avatar" class="block text-sm font-medium text-gray-600 mb-2">
                            Photo
                        </label>

                        <!-- Custom File Input -->
                        <div class="flex items-center justify-left w-full">
                            <label for="avatar"
                                class="flex flex-col items-center bg-sky-500 text-white rounded-lg shadow-lg px-4 py-2 cursor-pointer hover:bg-sky-600 transition-colors">
                                <span class="text-xs">Choose a File</span>
                                <input type="file" id="avatar" @change="handleAvatarUpload" class="hidden" />
                            </label>
                        </div>
                    </div>


                    <div class="pt-4">
                        <button @click.prevent="submitRegister"
                            class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                            Register
                        </button>
                    </div>
                </form>

                <div class="mt-4 text-center">
                    <RouterLink to="login" class="text-gray-700 hover:underline  text-sm">
                        Login
                    </RouterLink>
                </div>

                <div v-if="responseData" class="mt-4 text-center text-gray-700">
                    <p>{{ responseData }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
