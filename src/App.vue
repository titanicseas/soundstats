<template>
  <Login v-if="!isAuthenticated" />
  <Dashboard v-else />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Login from './components/auth/Login.vue'
import Dashboard from './components/dashboard/Dashboard.vue'
import { getAccessToken } from './utils/auth'
import { useUserStore } from './stores/user'

const isAuthenticated = ref(false)
const { fetchUserProfile } = useUserStore()

// Watch for authentication state changes
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    fetchUserProfile()
  }
})

onMounted(async () => {
  // Check for auth code in URL
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (code) {
    try {
      // Exchange code for access token
      const data = await getAccessToken(code)
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      // Set expiry time
      const expiryTime = new Date().getTime() + data.expires_in * 1000
      localStorage.setItem('token_expiry', expiryTime.toString())
      
      isAuthenticated.value = true
      
      // Remove code from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      // Handle error (e.g., show error message to user)
    }
  } else {
    // Check if we have a valid token
    const accessToken = localStorage.getItem('access_token')
    const tokenExpiry = localStorage.getItem('token_expiry')
    
    if (accessToken && tokenExpiry) {
      const now = new Date().getTime()
      if (now < parseInt(tokenExpiry)) {
        isAuthenticated.value = true
      } else {
        // Token expired, clear storage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expiry')
      }
    }
  }
})
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

*::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
