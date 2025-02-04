<template>
  <div class="min-h-screen flex items-center justify-center bg-[#E5E7EB] dark:bg-neutral-900">
    <div class="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg max-w-md w-full">
      <div class="text-center mb-8">
        <img src="/soundstats.svg" class="w-16 h-16 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-neutral-800 dark:text-white">Welcome to Sound Stats</h1>
        <p class="text-neutral-500 dark:text-neutral-400 mt-2">Connect with your Spotify account to view your listening insights</p>
      </div>
      
      <button 
        @click="login" 
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        <span>Connect with Spotify</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { generateCodeVerifier, generateCodeChallenge } from '../../utils/auth'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative'
]

async function login() {
  // Generate and store code verifier
  const codeVerifier = generateCodeVerifier(128)
  localStorage.setItem('code_verifier', codeVerifier)

  // Generate code challenge
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'true'
  })

  // Redirect to Spotify authorization page
  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString()
}
</script> 
