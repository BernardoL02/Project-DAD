<script setup>
import { defineProps, defineEmits, ref, computed, onMounted, onBeforeUnmount, defineExpose } from 'vue';

const props = defineProps({
    options: {
        type: Array,
        required: true,
    },
    modelValue: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['select', 'update:modelValue']);
const isOpen = ref(false);
const dropdownRef = ref(null);
const buttonRef = ref(null);

const selectedOption = computed({
    get: () => props.modelValue || props.options[0] || 'Select an option',
    set: (value) => {
        emit('update:modelValue', value);
        emit('select', value);
    },
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

const handleSelect = (option) => {
    selectedOption.value = option;
    isOpen.value = false;
};

const closeDropdownOnOutsideClick = (event) => {
    if (
        dropdownRef.value &&
        !dropdownRef.value.contains(event.target) &&
        buttonRef.value &&
        !buttonRef.value.contains(event.target)
    ) {
        isOpen.value = false;
    }
};

const resetToDefault = () => {
    selectedOption.value = props.options[0];
};

defineExpose({
    resetToDefault,
});

onMounted(() => {
    document.addEventListener('click', closeDropdownOnOutsideClick);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', closeDropdownOnOutsideClick);
});
</script>

<template>
    <div class="relative inline-block text-left">
        <button type="button" ref="buttonRef" @click="toggleDropdown" class="inline-flex justify-between w-full sm:w-48 rounded-md border border-gray-300 bg-white py-2 px-4
             text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500
             focus:border-sky-500">
            <span class="flex items-center">
                {{ selectedOption }}
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
