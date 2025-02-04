import { ref } from 'vue'

export type TimeRange = 'short_term' | 'medium_term' | 'long_term'

interface Artist {
  id: string
  name: string
  genres: string[]
  images: { url: string }[]
  popularity: number
  uri: string
}

interface Track {
  id: string
  name: string
  artists: {
    id: string
    name: string
  }[]
  album: {
    id: string
    name: string
    images: { url: string }[]
  }
  duration_ms: number
  popularity: number
  uri: string
}

const topArtists = ref<Artist[]>([])
const topTracks = ref<Track[]>([])
const isLoadingArtists = ref(false)
const isLoadingTracks = ref(false)
const error = ref<string | null>(null)

export function useTopItemsStore() {
  const fetchTopItems = async (type: 'artists' | 'tracks', timeRange: TimeRange = 'medium_term', limit: number = 20) => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      error.value = 'No access token found'
      return
    }

    if (type === 'artists') {
      isLoadingArtists.value = true
    } else {
      isLoadingTracks.value = true
    }
    error.value = null

    try {
      const response = await fetch(
        'https://api.spotify.com/v1/me/top/' + type + '?time_range=' + timeRange + '&limit=' + limit,
        {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch top ' + type)
      }

      const data = await response.json()
      if (type === 'artists') {
        topArtists.value = data.items
      } else {
        topTracks.value = data.items
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching top ' + type + ':', err)
    } finally {
      if (type === 'artists') {
        isLoadingArtists.value = false
      } else {
        isLoadingTracks.value = false
      }
    }
  }

  const clearTopItems = () => {
    topArtists.value = []
    topTracks.value = []
    error.value = null
  }

  return {
    topArtists,
    topTracks,
    isLoadingArtists,
    isLoadingTracks,
    error,
    fetchTopItems,
    clearTopItems,
  }
} 