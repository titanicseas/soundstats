import { ref } from 'vue'

interface UserProfile {
  id: string
  display_name: string
  email: string
  images: { url: string }[]
  product: string
  followers: { total: number }
}

const userProfile = ref<UserProfile | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useUserStore() {
  const fetchUserProfile = async () => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      error.value = 'No access token found'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      userProfile.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching user profile:', err)
    } finally {
      isLoading.value = false
    }
  }

  const clearUserData = () => {
    userProfile.value = null
    error.value = null
  }

  return {
    userProfile,
    isLoading,
    error,
    fetchUserProfile,
    clearUserData,
  }
} 
