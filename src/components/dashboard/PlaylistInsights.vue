<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold dark:text-white">Playlist Insights</h2>
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
    <div v-else-if="error && playlists.length === 0" class="text-red-500 dark:text-red-400 text-center py-8">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="playlist in playlists" :key="playlist.id"
        class="bg-white dark:bg-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition">
        <!-- Playlist Header -->
        <div class="flex items-center space-x-4">
          <!-- Playlist Cover -->
          <div class="w-16 h-16 flex-shrink-0">
            <img 
              v-if="playlist.images[0]"
              :src="playlist.images[0].url" 
              :alt="playlist.name"
              class="w-full h-full object-cover rounded"
            />
            <div 
              v-else 
              class="w-full h-full bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center"
            >
              <span class="text-2xl">🎵</span>
            </div>
          </div>

          <!-- Playlist Info -->
          <div class="flex-1 min-w-0">
            <a 
              :href="playlist.external_urls.spotify" 
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline"
            >
              <h3 class="font-medium truncate dark:text-white">{{ playlist.name }}</h3>
            </a>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
              {{ playlist.tracks.total }} tracks
            </p>
          </div>

          <!-- Public/Private Badge -->
          <div 
            :class="[
              'px-2 py-1 text-xs rounded-full',
              playlist.public 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
            ]"
          >
            {{ playlist.public ? 'Public' : 'Private' }}
          </div>
        </div>

        <!-- Playlist Description -->
        <p v-if="playlist.description" class="mt-3 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {{ playlist.description }}
        </p>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <StatCard 
        title="Total Playlists" 
        :value="totalPlaylists.toString()" 
        icon="📝" />
      <StatCard 
        title="Total Tracks" 
        :value="totalTracks.toString()" 
        icon="🎵" />
      <StatCard 
        title="Public Playlists" 
        :value="publicPlaylistsPercentage" 
        icon="🌍" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSpotifyStore } from '../../stores/spotify'
import StatCard from '../common/StatCard.vue'

const spotify = useSpotifyStore()

// Computed values for template
const loading = computed(() => spotify.isLoading.value.playlists)
const error = computed(() => spotify.error)
const playlists = computed(() => spotify.userPlaylists.value)

// Action to refresh data
const refreshData = async () => {
  try {
    await spotify.fetchUserPlaylists()
  } catch (err) {
    console.error('Error refreshing playlists:', err)
  }
}

// Computed statistics
const totalPlaylists = computed(() => playlists.value.length)

const totalTracks = computed(() => {
  return playlists.value.reduce((acc, playlist) => acc + playlist.tracks.total, 0)
})

const publicPlaylistsPercentage = computed(() => {
  if (playlists.value.length === 0) return '0%'
  const publicCount = playlists.value.filter(playlist => playlist.public).length
  const percentage = (publicCount / playlists.value.length) * 100
  return `${Math.round(percentage)}%`
})
</script> 
