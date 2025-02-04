// Generate a random string for the code verifier
export const generateCodeVerifier = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], "")
}

// Generate the code challenge from the verifier
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

// Get access token from code
export const getAccessToken = async (code: string): Promise<{
  access_token: string
  token_type: string
  scope: string
  expires_in: number
  refresh_token: string
}> => {
  const codeVerifier = localStorage.getItem('code_verifier')
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      code_verifier: codeVerifier!,
    }),
  })

  return response.json()
} 
