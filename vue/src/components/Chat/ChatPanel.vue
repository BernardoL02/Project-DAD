<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useLobbyStore } from '@/stores/lobby';

const props = defineProps({
    openChats: Array,
    activeChatIndex: Number,
});

const emit = defineEmits(['send', 'closeChat', 'switchChat']);

const storeLobby = useLobbyStore();
const newMessage = ref('');

const sendMessage = () => {
    const currentChat = props.openChats[props.activeChatIndex];
    if (newMessage.value.trim() && currentChat) {
        storeLobby.sendPrivateMessage(currentChat.user, newMessage.value);
        newMessage.value = '';
    }
};
</script>

<template>
    <div class="chat-panel h-full w-full bg-white shadow-lg flex flex-col max-h-[500px]">
        <!-- Abas de Chats -->
        <div class="flex border-b">
            <div v-for="(chat, index) in openChats" :key="chat.user.id" @click="emit('switchChat', index)"
                class="p-2 cursor-pointer"
                :class="['border-b-2', { 'border-blue-500 font-bold': index === activeChatIndex }]">
                {{ chat.user.nickname }}
                <button @click.stop="emit('closeChat', index)" class="ml-2 text-red-500">x</button>
            </div>
        </div>

        <!-- Área de Mensagens com Scroll -->
        <div class="flex-1 overflow-y-auto p-4 min-h-[150px] max-h-[300px]">
            <div v-if="openChats.length > 0">
                <div v-for="(msg, index) in openChats[activeChatIndex]?.messages" :key="index" class="mb-4">
                    <div class="font-bold">{{ msg.sender }}:</div>
                    <div>{{ msg.text }}</div>
                </div>
            </div>
            <div v-else class="text-gray-400 italic">No chats open. Select a user to start chatting.</div>
        </div>

        <!-- Input para Enviar Mensagem Fixado no Fundo -->
        <div class="p-4 border-t bg-white">
            <input v-model="newMessage" @keydown.enter="sendMessage"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..." />
        </div>
    </div>
</template>

<style scoped>
.chat-panel {
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
