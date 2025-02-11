<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold dark:text-white">Top Artists</h2>
      <TimeRangeSelector v-model="selectedTimeRange" />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 dark:border-white"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error && artists.length === 0" class="text-red-500 dark:text-red-400 text-center py-8">
      {{ error }}
    </div>

    <!-- Empty state for new accounts -->
    <div v-else-if="artists.length === 0" class="text-center py-8">
      <p class="text-neutral-600 dark:text-neutral-400">
        No listening data available yet. Start listening to music to see your top artists!
      </p>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="(artist, index) in artists.slice(0, 15)" :key="artist.id"
        class="bg-white dark:bg-neutral-800 rounded-lg p-4 flex items-center space-x-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition">
        <!-- Rank -->
        <div class="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center font-medium">
          {{ index + 1 }}
        </div>

        <!-- Artist Image with Link -->
        <a 
          :href="artist.external_urls.spotify" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-16 h-16 flex-shrink-0 hover:opacity-80 transition"
        >
          <img 
            v-if="artist.images[0]"
            :src="artist.images[0].url" 
            :alt="artist.name"
            class="w-full h-full object-cover rounded-full"
          />
          <div 
            v-else 
            class="w-full h-full bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center"
          >
            <span class="text-2xl">👤</span>
          </div>
        </a>

        <!-- Artist info -->
        <div class="flex-1 min-w-0">
          <a 
            :href="artist.external_urls.spotify" 
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline"
          >
            <h3 class="font-medium truncate dark:text-white">{{ artist.name }}</h3>
          </a>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
            {{ artist.genres.slice(0, 2).join(', ') }}
          </p>
          <!-- Popularity Bar -->
          <div class="mt-2 flex items-center space-x-2 group relative">
            <div class="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-green-500 rounded-full"
                :style="{ width: artist.popularity + '%' }"
              ></div>
            </div>
            <span class="text-xs text-neutral-500 dark:text-neutral-400 min-w-[2.5rem] text-right">
              {{ artist.popularity }}%
            </span>
            <!-- Tooltip -->
            <div class="absolute -top-8 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div class="bg-neutral-800 dark:bg-white text-white dark:text-neutral-800 text-xs rounded px-2 py-1 text-center">
                Spotify popularity score
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div v-if="artists.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <StatCard 
        title="Most Common Genre" 
        :value="mostCommonGenre" 
        icon="🎵" />
      <StatCard 
        title="Average Popularity" 
        :value="averagePopularity + '%'" 
        icon="📈" />
      <StatCard 
        title="Total Genres" 
        :value="uniqueGenres.toString()" 
        icon="🏷️" />
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
      await spotify.fetchTopItems('artists', newRange)
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
  if (!artists.value.length) {
    try {
      await spotify.fetchTopItems('artists', selectedTimeRange.value)
    } catch (err) {
      if (err instanceof Error) {
        showToastMessage(err.message, 'error')
      }
    }
  }
})

// Computed values for template
const loading = computed(() => spotify.isLoading.value.artists)
const error = computed(() => spotify.error)
const artists = computed(() => spotify.topArtists.value)

// Computed statistics
const mostCommonGenre = computed(() => {
  const genres = artists.value.flatMap(artist => artist.genres)
  if (genres.length === 0) return 'N/A'
  
  const genreCounts = genres.reduce((acc: Record<string, number>, genre: string) => {
    acc[genre] = (acc[genre] || 0) + 1
    return acc
  }, {})
  
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
  return sortedGenres[0][0]
})

const averagePopularity = computed(() => {
  if (artists.value.length === 0) return 0
  const sum = artists.value.reduce((acc: number, artist) => acc + artist.popularity, 0)
  return Math.round(sum / artists.value.length)
})

const uniqueGenres = computed(() => {
  return new Set(artists.value.flatMap(artist => artist.genres)).size
})
</script> 
