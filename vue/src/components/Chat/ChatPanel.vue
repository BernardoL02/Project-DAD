<script setup>
import { ref, defineProps, defineEmits, nextTick, watch } from 'vue';
import 'emoji-picker-element';

const props = defineProps({
    openChats: Array,
    activeChatIndex: Number,
});

const emit = defineEmits(['send', 'closeChat', 'switchChat']);
const newMessage = ref('');
const showEmojiPicker = ref(false);
const messageInput = ref(null);
const messagesContainer = ref(null);

// Função para enviar mensagem
const sendMessage = () => {
    const currentChat = props.openChats[props.activeChatIndex];
    if (newMessage.value.trim() && currentChat) {
        emit('send', { user: currentChat.user, message: newMessage.value });
        newMessage.value = '';
        scrollToBottom();
    }
};

// Função para rolar até a última mensagem
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

// Função para alternar o seletor de emojis
const toggleEmojiPicker = () => {
    showEmojiPicker.value = !showEmojiPicker.value;
};

// Função para adicionar emoji à mensagem
const addEmoji = (event) => {
    newMessage.value += event.detail.unicode;
    showEmojiPicker.value = false;
    nextTick(() => messageInput.value.focus());
};

// Watcher para rolar automaticamente ao receber novas mensagens
watch(
    () => props.openChats[props.activeChatIndex]?.messages,
    () => {
        scrollToBottom();
    },
    { deep: true }
);

watch(
    () => props.activeChatIndex,
    () => {
        scrollToBottom();
    }
);
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
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 min-h-[150px] max-h-[300px]">
            <div v-if="openChats.length > 0">
                <div v-for="(msg, index) in openChats[activeChatIndex]?.messages" :key="index" class="mb-4">
                    <div class="font-bold">{{ msg.sender }}:</div>
                    <div>{{ msg.text }}</div>
                </div>
            </div>
            <div v-else class="text-gray-400 italic">No chats open. Select a user to start chatting.</div>
        </div>

        <!-- Input para Enviar Mensagem Fixado no Fundo -->
        <div class="p-4 border-t bg-white flex items-center space-x-2">
            <input v-model="newMessage" @keydown.enter="sendMessage" ref="messageInput"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..." />
            <!-- Botão para abrir o seletor de emojis -->
            <div class="relative">
                <button @click="toggleEmojiPicker" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    😊
                </button>

                <!-- Emoji Picker -->
                <emoji-picker v-if="showEmojiPicker" @emoji-click="addEmoji" class="emoji-picker"></emoji-picker>
            </div>
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

.emoji-picker {
    width: 300px;
    height: 350px;
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 8px;
    z-index: 1000;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
}
</style>
