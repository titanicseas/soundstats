<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold dark:text-white">Recently Played</h2>
      <button 
        @click="refreshData"
        class="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition"
      >
        Refresh
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 dark:border-white"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error && recentTracks.length === 0" class="text-red-500 dark:text-red-400 text-center py-8">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="item in recentTracks.slice(0, 5)" :key="item.played_at"
        class="bg-white dark:bg-neutral-800 rounded-lg p-4 flex items-center space-x-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition">
        <!-- Album Art -->
        <div class="w-12 h-12 flex-shrink-0">
          <img 
            :src="item.track.album.images[0]?.url" 
            :alt="item.track.album.name"
            class="w-full h-full object-cover rounded"
          />
        </div>

        <!-- Track Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-medium truncate dark:text-white">{{ item.track.name }}</h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
            {{ item.track.artists.map(artist => artist.name).join(', ') }}
          </p>
        </div>

        <!-- Played At -->
        <div class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ formatPlayedAt(item.played_at) }}
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <StatCard 
        title="Most Played Artist" 
        :value="mostPlayedArtist" 
        icon="👤" />
      <StatCard 
        title="Listening Time" 
        :value="totalListeningTime" 
        icon="⏱️" />
      <StatCard 
        title="Unique Tracks" 
        :value="uniqueTracksCount.toString()" 
        icon="🎵" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSpotifyStore } from '../../stores/spotify'
import StatCard from '../common/StatCard.vue'

const spotify = useSpotifyStore()

// Computed values for template
const loading = computed(() => spotify.isLoading.value.recent)
const error = computed(() => spotify.error)
const recentTracks = computed(() => spotify.recentTracks.value)

// Helper function to format played_at timestamp
const formatPlayedAt = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffMins / 1440)
    return `${days}d ago`
  }
}

// Action to refresh data
const refreshData = async () => {
  try {
    await spotify.fetchRecentlyPlayed()
  } catch (err) {
    console.error('Error refreshing recently played tracks:', err)
  }
}

// Computed statistics
const mostPlayedArtist = computed(() => {
  const artists = recentTracks.value.flatMap(item => item.track.artists)
  if (artists.length === 0) return 'N/A'
  
  const artistCounts = artists.reduce((acc: Record<string, number>, artist) => {
    acc[artist.name] = (acc[artist.name] || 0) + 1
    return acc
  }, {})
  
  const sortedArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
  return sortedArtists[0][0]
})

const totalListeningTime = computed(() => {
  const totalMs = recentTracks.value.reduce((acc, item) => acc + item.track.duration_ms, 0)
  const hours = Math.floor(totalMs / 3600000)
  const minutes = Math.floor((totalMs % 3600000) / 60000)
  return `${hours}h ${minutes}m`
})

const uniqueTracksCount = computed(() => {
  return new Set(recentTracks.value.map(item => item.track.id)).size
})
</script> 