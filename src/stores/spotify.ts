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
  external_urls: {
    spotify: string
  }
}

interface Track {
  id: string
  name: string
  artists: {
    id: string
    name: string
    external_urls: {
      spotify: string
    }
  }[]
  album: {
    id: string
    name: string
    images: { url: string }[]
    external_urls: {
      spotify: string
    }
    restrictions: {
      reason: "market" | "product" | "explicit"
    }
  }
  external_urls: {
    spotify: string
  }
  duration_ms: number
  popularity: number
  uri: string
  explicit: boolean
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
  external_urls: {
    spotify: string
  }
}

// State
const userProfile = ref<UserProfile | null>(null)
const topArtists = ref<Artist[]>([])
const topTracks = ref<Track[]>([])
const recentTracks = ref<RecentTrack[]>([])
const userPlaylists = ref<Playlist[]>([])
const currentTimeRange = ref<TimeRange>('medium_term')
const previousTimeRange = ref<TimeRange>('medium_term')

// Track if we've attempted to fetch data for new accounts
const hasAttemptedFetch = ref({
  artists: false,
  tracks: false,
  recent: false,
  playlists: false
})

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

    // Handle both 200 OK and 304 Not Modified as success cases
    if (response.ok || response.status === 304) {
      const data = await response.json()
      return data
    }

    // Handle specific error cases
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    throw new Error('Failed to fetch from Spotify API')
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
    const loadingKey = type === 'artists' ? 'artists' : 'tracks'
    
    // Only prevent fetching if we're already loading or if it's the same timeRange we've already attempted
    if (isLoading.value[loadingKey] || (hasAttemptedFetch.value[loadingKey] && timeRange === currentTimeRange.value)) return
    
    isLoading.value[loadingKey] = true
    error.value = null
    previousTimeRange.value = currentTimeRange.value

    try {
      const data = await fetchFromSpotify('/me/top/' + type + '?time_range=' + timeRange + '&limit=15')
      
      // Only update data if time range is different or we don't have data yet
      const shouldUpdateData = timeRange !== currentTimeRange.value || 
        (type === 'artists' ? topArtists.value.length === 0 : topTracks.value.length === 0)

      if (shouldUpdateData) {
        // Handle empty response without throwing error
        if (!data.items || data.items.length === 0) {
          if (type === 'artists') {
            topArtists.value = []
          } else {
            topTracks.value = []
          }
          // Only revert time range if we were changing it and got no data
          if (timeRange !== previousTimeRange.value) {
            currentTimeRange.value = previousTimeRange.value
          }
        } else {
          if (type === 'artists') {
            topArtists.value = data.items
          } else {
            topTracks.value = data.items
          }
          currentTimeRange.value = timeRange
        }
      }
      
      // Mark as attempted for this time range
      hasAttemptedFetch.value[loadingKey] = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching top ' + type + ':', err)
      
      // Reset data for this type only if we were going to update it
      if (timeRange !== currentTimeRange.value || 
          (type === 'artists' ? topArtists.value.length === 0 : topTracks.value.length === 0)) {
        if (type === 'artists') {
          topArtists.value = []
        } else {
          topTracks.value = []
        }
      }
    } finally {
      isLoading.value[loadingKey] = false
    }
  }

  // Fetch recently played tracks
  const fetchRecentlyPlayed = async (limit: number = 15) => {
    // Don't fetch if we're already loading or have already attempted for new accounts
    if (isLoading.value.recent || hasAttemptedFetch.value.recent) return

    isLoading.value.recent = true
    error.value = null

    try {
      const data = await fetchFromSpotify('/me/player/recently-played?limit=' + limit)
      recentTracks.value = data.items || []
      hasAttemptedFetch.value.recent = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching recently played tracks:', err)
      recentTracks.value = []
    } finally {
      isLoading.value.recent = false
    }
  }

  // Fetch user playlists
  const fetchUserPlaylists = async (limit: number = 20, offset: number = 0) => {
    // Don't fetch if we're already loading or have already attempted for new accounts
    if (isLoading.value.playlists || hasAttemptedFetch.value.playlists) return

    isLoading.value.playlists = true
    error.value = null

    try {
      const data = await fetchFromSpotify('/me/playlists?limit=' + limit + '&offset=' + offset)
      userPlaylists.value = data.items || []
      hasAttemptedFetch.value.playlists = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching user playlists:', err)
      userPlaylists.value = []
    } finally {
      isLoading.value.playlists = false
    }
  }

  // Reset fetch attempts (useful for manual refresh)
  const resetFetchAttempts = () => {
    hasAttemptedFetch.value = {
      artists: false,
      tracks: false,
      recent: false,
      playlists: false
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
    resetFetchAttempts()
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
    previousTimeRange,
    hasAttemptedFetch,

    // Actions
    fetchUserProfile,
    fetchTopItems,
    fetchRecentlyPlayed,
    fetchUserPlaylists,
    clearData,
    resetFetchAttempts
  }
} 
