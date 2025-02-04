import { ref } from 'vue'

interface Track {
  track: {
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
    uri: string
  }
  played_at: string
  context: {
    type: string
    uri: string
  } | null
}

const recentTracks = ref<Track[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useRecentlyPlayedStore() {
  const fetchRecentlyPlayed = async (limit: number = 20) => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      error.value = 'No access token found'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        'https://api.spotify.com/v1/me/player/recently-played?limit=' + limit,
        {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch recently played tracks')
      }

      const data = await response.json()
      recentTracks.value = data.items
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching recently played tracks:', err)
    } finally {
      isLoading.value = false
    }
  }

  const clearRecentlyPlayed = () => {
    recentTracks.value = []
    error.value = null
  }

  return {
    recentTracks,
    isLoading,
    error,
    fetchRecentlyPlayed,
    clearRecentlyPlayed,
  }
} 