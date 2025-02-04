<template>
  <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{{ title }}</h3>
        <p class="mt-2 text-3xl font-bold text-neutral-800 dark:text-white" v-if="value">{{ value }}</p>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <slot name="icon"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value?: string
  subtitle?: string
}>()
</script> 
