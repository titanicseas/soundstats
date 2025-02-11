<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="show"
      class="fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg max-w-sm z-50"
      :class="[
        type === 'error' ? 'bg-red-500 text-white' : 'bg-neutral-800 dark:bg-white text-white dark:text-neutral-800'
      ]"
    >
      <div class="flex items-center space-x-2">
        <span v-if="type === 'error'" class="text-lg">⚠️</span>
        <span v-else class="text-lg">ℹ️</span>
        <p>{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
  type?: 'info' | 'error'
}>()
</script> 
