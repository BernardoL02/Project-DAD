<script setup>
import { defineProps, defineEmits, ref, onMounted, onBeforeUnmount } from 'vue'

// Definir as propriedades que o componente vai receber
const props = defineProps({
    buttonText: {
        type: String,
        required: true
    },
    options: {
        type: Array,
        required: true
    }
})

// Definir os eventos que o componente vai emitir
const emit = defineEmits(['select'])

const isOpen = ref(false) // Variável para controlar a visibilidade do dropdown
const dropdownRef = ref(null) // Referência para o dropdown
const buttonRef = ref(null) // Referência para o botão
const selectedOption = ref('') // Variável para armazenar a opção selecionada

// Função para alternar a visibilidade do dropdown
const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

// Função para emitir a seleção de uma opção e fechar o dropdown
const handleSelect = (selectedOptionValue) => {
    selectedOption.value = selectedOptionValue // Armazena o valor selecionado
    emit('select', selectedOptionValue) // Emite o evento
    isOpen.value = false // Fecha o dropdown
}

// Detecta se o clique foi fora do dropdown e fecha o menu
const closeDropdownOnOutsideClick = (event) => {
    if (
        dropdownRef.value && !dropdownRef.value.contains(event.target) &&
        buttonRef.value && !buttonRef.value.contains(event.target)
    ) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', closeDropdownOnOutsideClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', closeDropdownOnOutsideClick)
})
</script>

<template>
    <div class="relative inline-block text-left">
        <!-- Botão para abrir o dropdown -->
        <button type="button" ref="buttonRef" @click="toggleDropdown" class="inline-flex justify-center w-full sm:w-48 rounded-md border border-gray-300 bg-white py-2 px-4
            text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:border-blue-500" id="menu-button" aria-expanded="true" aria-haspopup="true">
            <!-- Exibe a opção selecionada ou o texto inicial -->
            {{ selectedOption.value || options[0] }}
        </button>

        <!-- Dropdown menu -->
        <div v-if="isOpen" ref="dropdownRef" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black
            ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
            <div class="py-1" role="none">
                <template v-for="option in props.options" :key="option">
                    <a href="#" @click.prevent="handleSelect(option)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        {{ option }}
                    </a>
                </template>
            </div>
        </div>
    </div>
</template>
