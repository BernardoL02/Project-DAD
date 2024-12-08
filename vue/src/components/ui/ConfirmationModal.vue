<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white p-6 rounded shadow-md w-96">
        <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
        <p class="mb-4">{{ message }}</p>
        <div class="flex justify-end space-x-4">
          <button
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            @click="cancel"
          >
            Cancel
          </button>
          <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" @click="confirm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const confirm = () => emit('confirm')
const cancel = () => emit('cancel')
</script>
