<template>
  <div class="min-h-screen bg-[#E5E7EB] dark:bg-neutral-900">
    <Header />
    
    <main class="container mx-auto px-4 pt-24 pb-12 space-y-12">
      <!-- Global loading indicator -->
      <div v-if="isInitialLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 dark:border-white"></div>
      </div>

      <!-- Global error state -->
      <div v-else-if="error" class="text-red-500 dark:text-red-400 text-center py-8">
        {{ error }}
        <button 
          @click="retryLoading"
          class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Retry
        </button>
      </div>

      <!-- Dashboard content -->
      <template v-else>
        <TopTracks />
        <TopArtists />
        <RecentlyPlayed />
        <PlaylistInsights />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import Header from '../layout/Header.vue'
import TopTracks from './TopTracks.vue'
import TopArtists from './TopArtists.vue'
import RecentlyPlayed from './RecentlyPlayed.vue'
import PlaylistInsights from './PlaylistInsights.vue'
import { useSpotifyStore } from '../../stores/spotify'

const spotify = useSpotifyStore()
const error = ref<string | null>(null)

// Compute if we're in the initial loading state
const isInitialLoading = computed(() => {
  return Object.values(spotify.isLoading.value).some(loading => loading)
})

// Function to load all data
const loadAllData = async () => {
  const accessToken = localStorage.getItem('access_token')
  if (!accessToken) {
    error.value = 'No access token found. Please log in again.'
    return
  }

  error.value = null
  try {
    await Promise.all([
      spotify.fetchUserProfile(),
      spotify.fetchTopItems('tracks'),
      spotify.fetchTopItems('artists'),
      spotify.fetchRecentlyPlayed(),
      spotify.fetchUserPlaylists()
    ])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred while loading data'
    console.error('Error fetching data:', err)
  }
}

// Function to retry loading data
const retryLoading = () => {
  loadAllData()
}

// Load data when component is mounted
onMounted(() => {
  loadAllData()
})
</script> 
