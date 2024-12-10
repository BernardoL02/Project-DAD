<!-- ChatPanel.vue -->
<script setup>
import { ref, defineExpose, defineProps, defineEmits, watch } from 'vue';

// Estado para controlar se o painel está aberto
const isOpen = ref(false);

// Estado para armazenar o usuário atual
const user = ref(null);

// Estado para armazenar a nova mensagem
const newMessage = ref('');

// Estado para armazenar as mensagens
const messages = ref([]);



// Função para fechar o painel
const closePanel = () => {
    isOpen.value = false;
    user.value = null;
};

// Evento para emitir a mensagem para o componente pai
const emit = defineEmits(['send']);

// Função para abrir o painel com o usuário selecionado
const openPanel = (selectedUser, newMessages = []) => {
    user.value = selectedUser;
    messages.value = newMessages;
    isOpen.value = true;
};

const sendMessage = () => {
    if (newMessage.value.trim() && user.value) {
        console.log('Emitting send event:', user.value, newMessage.value);
        emit('send', { user: user.value, message: newMessage.value });
        newMessage.value = '';
    }
};

// Expõe as funções para uso externo
defineExpose({ openPanel, closePanel });
</script>

<template>
    <div v-if="isOpen" class="chat-panel h-full w-full bg-white shadow-lg flex flex-col max-h-[500px]">
        <!-- Área de Mensagens com Scroll -->
        <div class="overflow-y-auto p-4 min-h-[150px] max-h-[300px]">
            <div v-for="(msg, index) in messages" :key="index" class="mb-4">
                <div class="font-bold">{{ msg.sender }}:</div>
                <div>{{ msg.text }}</div>
            </div>
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
