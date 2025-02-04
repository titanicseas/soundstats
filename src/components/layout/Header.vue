<template>
  <header class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
    <div class="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow-lg rounded-full px-8 py-3">
      <div class="flex items-center justify-between w-[600px]">
        <div class="flex items-center space-x-3">
          <img src="/soundstats.svg" class="w-8 h-8 text-green-500" />
          <h1 class="text-xl font-bold text-neutral-800 dark:text-white">Sound Stats</h1>
        </div>
        <div class="flex items-center space-x-4">
          <span v-if="userProfile" class="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {{ userProfile.display_name }}
          </span>
          <div v-if="userProfile" class="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <img 
              v-if="userProfile.images?.[0]?.url" 
              :src="userProfile.images[0].url" 
              :alt="userProfile.display_name"
              class="w-full h-full object-cover"
            />
            <svg v-else class="w-4 h-4 m-2 text-neutral-500 dark:text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <button 
            @click="toggleTheme" 
            class="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            <svg v-if="isDark" class="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'

const isDark = ref(false)
const { userProfile } = useUserStore()

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // Check for saved theme preference or system preference
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})
</script> 
