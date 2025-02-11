# Sound Stats

This is a simple app that displays the stats of your Spotify account.

## Features

-   Display your top tracks
-   Display your top artists
-   Display overview of your playlists
-   Display overview of recently played tracks

## Tech Stack

-   Vue 3
-   TypeScript
-   Vite
-   Tailwind CSS
-   Spotify API


## Required Spotify OAuth Scopes

Soundstats requires the following Spotify OAuth scopes to function properly:

- `user-read-private`: Read access to user's subscription details (type of Spotify account)
- `user-read-email`: Read access to user's email address
- `user-top-read`: Read access to user's top artists and tracks
- `user-read-recently-played`: Read access to user's recently played tracks
- `playlist-read-private`: Read access to user's private playlists
- `playlist-read-collaborative`: Read access to user's collaborative playlists

These scopes allow Soundstats to:
- Display your top tracks and artists over different time periods
- Show your recently played tracks
- List your playlists (both public and private)

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Spotify Developer account and registered application

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/soundstats.git
cd soundstats
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your Spotify credentials:
```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Attribution

This application uses the Spotify Web API for fetching music data. All music data, artwork, and metadata are property of Spotify and its partners.

## License

[MIT License](LICENSE)
