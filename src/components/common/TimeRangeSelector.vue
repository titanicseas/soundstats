<template>
  <div class="flex space-x-2">
    <button
      v-for="option in timeRangeOptions"
      :key="option.value"
      @click="$emit('update:modelValue', option.value)"
      :class="[
        'px-3 py-1.5 text-sm rounded-full transition',
        modelValue === option.value
          ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-800'
          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
      ]"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { type TimeRange } from '../../stores/spotify'

defineProps<{
  modelValue: TimeRange
}>()

defineEmits<{
  'update:modelValue': [value: TimeRange]
}>()

const timeRangeOptions = [
  { label: '4 Weeks', value: 'short_term' },
  { label: '6 Months', value: 'medium_term' },
  { label: 'All Time', value: 'long_term' }
] as const
</script> 
