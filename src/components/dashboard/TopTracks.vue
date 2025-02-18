<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold dark:text-white">Top Tracks</h2>
      <TimeRangeSelector v-model="selectedTimeRange" />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 dark:border-white"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error !== null && tracks.length === 0" class="text-red-500 dark:text-red-400 text-center py-8">
      {{ error }}
    </div>

    <!-- Empty state for new accounts -->
    <div v-else-if="tracks.length === 0" class="text-center py-8">
      <p class="text-neutral-600 dark:text-neutral-400">
        No listening data available yet. Start listening to music to see your top tracks!
      </p>
    </div>

    <!-- Content -->
    <div v-else-if="tracks.length > 0" class="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden">
      <div v-for="(track, index) in tracks.slice(0, 5)" :key="track.id"
        class="flex items-center p-4 space-x-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition border-b border-neutral-100 dark:border-neutral-700 last:border-0">
        <!-- Rank -->
        <div class="w-8 text-center font-medium text-neutral-500 dark:text-neutral-400">
          {{ index + 1 }}
        </div>

        <!-- Album Art with Link -->
        <a 
          :href="tracks[index].album.external_urls.spotify" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-12 h-12 flex-shrink-0 hover:opacity-80 transition"
        >
          <img 
            v-if="tracks[index].album.images[0]"
            :src="tracks[index].album.images[0].url" 
            :alt="tracks[index].album.name"
            class="w-full h-full object-cover rounded"
          />
          <div 
            v-else 
            class="w-full h-full bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center"
          >
            <span class="text-2xl">🎵</span>
          </div>
        </a>

        <!-- Track Info -->
        <div class="flex-1 min-w-0">
          <a 
            :href="tracks[index].external_urls.spotify" 
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline"
          >
            <h3 class="font-medium truncate dark:text-white">{{ tracks[index].name }}</h3>
          </a>
          <div class="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
            <p class="truncate">
              <template v-for="(artist, idx) in tracks[index].artists" :key="artist.id">
                <a 
                  :href="artist.external_urls.spotify"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:underline"
                >{{ artist.name }}</a><span v-if="idx < tracks[index].artists.length - 1">, </span>
              </template>
            </p>
            <span class="mx-2">•</span>
            <a 
              :href="tracks[index].album.external_urls.spotify"
              target="_blank"
              rel="noopener noreferrer"
              class="truncate hover:underline"
            >
              {{ tracks[index].album.name }}
            </a>
          </div>
          <!-- Popularity Bar -->
          <div class="mt-1.5 flex items-center space-x-2 group relative">
            <div class="flex-1 h-1 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-green-500 rounded-full"
                :style="{ width: tracks[index].popularity + '%' }"
              ></div>
            </div>
            <span class="text-xs text-neutral-500 dark:text-neutral-400 min-w-[2.5rem] text-right">
              {{ tracks[index].popularity }}%
            </span>
            <!-- Tooltip -->
            <div class="absolute -top-8 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div class="bg-neutral-800 dark:bg-white text-white dark:text-neutral-800 text-xs rounded px-2 py-1 text-center">
                Spotify popularity score
              </div>
            </div>
          </div>
        </div>

        <!-- Duration -->
        <div class="text-sm text-neutral-500 dark:text-neutral-400 min-w-[4rem] text-right">
          {{ formatDuration(tracks[index].duration_ms) }}
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div v-if="tracks.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <StatCard 
        title="Total Time" 
        :value="totalDuration" 
        icon="⏱️" />
      <StatCard 
        title="Average Duration" 
        :value="averageDuration" 
        icon="📊" />
      <StatCard 
        title="Most Common Artist" 
        :value="mostCommonArtist" 
        icon="👤" />
    </div>

    <!-- Toast -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSpotifyStore, type TimeRange } from '../../stores/spotify'
import TimeRangeSelector from '../common/TimeRangeSelector.vue'
import StatCard from '../common/StatCard.vue'
import Toast from '../common/Toast.vue'

const spotify = useSpotifyStore()

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'info' | 'error'>('info')

// Show toast message
const showToastMessage = (message: string, type: 'info' | 'error' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const selectedTimeRange = computed({
  get: () => spotify.currentTimeRange.value,
  set: async (newRange: TimeRange) => {
    try {
      await spotify.fetchTopItems('tracks', newRange)
    } catch (err) {
      if (err instanceof Error) {
        showToastMessage(err.message, 'error')
      }
    }
  }
})

// Watch for errors
watch(() => spotify.error, (newError) => {
  if (newError) {
    showToastMessage(String(newError), 'error')
  }
})

// Fetch initial data
onMounted(async () => {
  if (!tracks.value.length) {
    try {
      await spotify.fetchTopItems('tracks', selectedTimeRange.value)
    } catch (err) {
      if (err instanceof Error) {
        showToastMessage(err.message, 'error')
      }
    }
  }
})

// Computed values for template
const loading = computed(() => spotify.isLoading.value.tracks)
const error = computed(() => spotify.error)
const tracks = computed(() => spotify.topTracks.value)

console.log({tracks: tracks.value, error: error.value, loading: loading.value})

// Helper function to format duration
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Computed statistics
const totalDuration = computed(() => {
  const totalMs = tracks.value.reduce((acc, track) => acc + track.duration_ms, 0)
  const hours = Math.floor(totalMs / 3600000)
  const minutes = Math.floor((totalMs % 3600000) / 60000)
  return `${hours}h ${minutes}m`
})

const averageDuration = computed(() => {
  if (tracks.value.length === 0) return '0:00'
  const avgMs = tracks.value.reduce((acc, track) => acc + track.duration_ms, 0) / tracks.value.length
  return formatDuration(avgMs)
})

const mostCommonArtist = computed(() => {
  const artists = tracks.value.flatMap(track => track.artists)
  if (artists.length === 0) return 'N/A'
  
  const artistCounts = artists.reduce((acc: Record<string, number>, artist) => {
    acc[artist.name] = (acc[artist.name] || 0) + 1
    return acc
  }, {})
  
  const sortedArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
  return sortedArtists[0][0]
})
</script> 
