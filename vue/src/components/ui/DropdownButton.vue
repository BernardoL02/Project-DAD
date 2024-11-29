<script setup>
import { defineProps, defineEmits, ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Definir as propriedades que o componente vai receber
const props = defineProps({
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
const selectedOption = ref(null) // Inicializamos com null ou vazio

// Computed para garantir que selectedOption não seja null ou undefined
const displayValue = computed(() => {
    return selectedOption.value || props.options[0] || 'Selecione uma opção'
})

// Função para alternar a visibilidade do dropdown
const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

// Função para emitir a seleção e fechar o dropdown
const handleSelect = (selectedOptionValue) => {
    selectedOption.value = selectedOptionValue // Atualiza a opção selecionada
    emit('select', selectedOptionValue) // Emite o valor selecionado
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
        <button type="button" ref="buttonRef" @click="toggleDropdown" class="inline-flex justify-between w-full sm:w-48 rounded-md border border-gray-300 bg-white py-2 px-4
            text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500
            focus:border-sky-500">
            <span class="flex items-center">
                {{ displayValue }}
            </span>
            <span class="ml-2 text-gray-500">&#x2193;</span>
        </button>

        <div v-if="isOpen" ref="dropdownRef" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black
            ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
            <div class="py-1" role="none">
                <template v-for="option in props.options" :key="option">
                    <a href="#" @click.prevent="handleSelect(option)"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-100" role="menuitem">
                        {{ option }}
                    </a>
                </template>
            </div>
        </div>
    </div>
</template>
