import { ref } from 'vue'

// Types
export type TimeRange = 'short_term' | 'medium_term' | 'long_term'

interface LoadingState {
  profile: boolean
  artists: boolean
  tracks: boolean
  recent: boolean
  playlists: boolean
}

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

interface RecentTrack {
  track: Track
  played_at: string
  context: {
    type: string
    uri: string
  } | null
}

interface UserProfile {
  id: string
  display_name: string
  email: string
  images: { url: string }[]
  product: string
  followers: { total: number }
}

interface Playlist {
  id: string
  name: string
  description: string | null
  images: { url: string }[]
  owner: {
    display_name: string
    id: string
  }
  tracks: {
    total: number
    href: string
  }
  public: boolean
  collaborative: boolean
  uri: string
}

// State
const userProfile = ref<UserProfile | null>(null)
const topArtists = ref<Artist[]>([])
const topTracks = ref<Track[]>([])
const recentTracks = ref<RecentTrack[]>([])
const userPlaylists = ref<Playlist[]>([])
const currentTimeRange = ref<TimeRange>('medium_term')

const isLoading = ref<LoadingState>({
  profile: false,
  artists: false,
  tracks: false,
  recent: false,
  playlists: false
})

const error = ref<string | null>(null)

// Store
export function useSpotifyStore() {
  // Helper function to make authenticated requests
  const fetchFromSpotify = async (endpoint: string) => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      throw new Error('No access token found')
    }

    const response = await fetch('https://api.spotify.com/v1' + endpoint, {
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from Spotify API')
    }

    return response.json()
  }

  // Fetch user profile
  const fetchUserProfile = async () => {
    isLoading.value.profile = true
    error.value = null

    try {
      userProfile.value = await fetchFromSpotify('/me')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching user profile:', err)
    } finally {
      isLoading.value.profile = false
    }
  }

  // Fetch top items (artists or tracks)
  const fetchTopItems = async (type: 'artists' | 'tracks', timeRange: TimeRange = currentTimeRange.value) => {
    // Only skip if we have data AND the time range hasn't changed
    const hasData = type === 'artists' 
      ? topArtists.value.length > 0 
      : topTracks.value.length > 0
    if (timeRange === currentTimeRange.value && hasData) return

    const loadingKey = type === 'artists' ? 'artists' : 'tracks'
    isLoading.value[loadingKey] = true
    error.value = null

    try {
      const data = await fetchFromSpotify('/me/top/' + type + '?time_range=' + timeRange + '&limit=15')
      if (type === 'artists') {
        topArtists.value = data.items
      } else {
        topTracks.value = data.items
      }
      currentTimeRange.value = timeRange
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching top ' + type + ':', err)
    } finally {
      isLoading.value[loadingKey] = false
    }
  }

  // Fetch recently played tracks
  const fetchRecentlyPlayed = async (limit: number = 15) => {
    isLoading.value.recent = true
    error.value = null

    try {
      const data = await fetchFromSpotify('/me/player/recently-played?limit=' + limit)
      recentTracks.value = data.items
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching recently played tracks:', err)
    } finally {
      isLoading.value.recent = false
    }
  }

  // Fetch user playlists
  const fetchUserPlaylists = async (limit: number = 20, offset: number = 0) => {
    isLoading.value.playlists = true
    error.value = null

    try {
      const data = await fetchFromSpotify('/me/playlists?limit=' + limit + '&offset=' + offset)
      userPlaylists.value = data.items
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching user playlists:', err)
    } finally {
      isLoading.value.playlists = false
    }
  }

  // Clear all data
  const clearData = () => {
    userProfile.value = null
    topArtists.value = []
    topTracks.value = []
    recentTracks.value = []
    userPlaylists.value = []
    error.value = null
  }

  return {
    // State
    userProfile,
    topArtists,
    topTracks,
    recentTracks,
    userPlaylists,
    isLoading,
    error,
    currentTimeRange,

    // Actions
    fetchUserProfile,
    fetchTopItems,
    fetchRecentlyPlayed,
    fetchUserPlaylists,
    clearData
  }
} 