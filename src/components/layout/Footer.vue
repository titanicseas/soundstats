<template>
  <footer class="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 mt-12">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col items-center justify-center space-y-4">
        <div class="flex items-center space-x-3">
          <span class="text-sm text-neutral-500 dark:text-neutral-400">Data provided by</span>
          <a 
            href="https://spotify.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-green-500 hover:text-green-600 transition flex items-center space-x-2"
          >
            <img src="/spotify.svg" class="h-5 w-auto" alt="Spotify" />
          </a>
        </div>
        <div class="text-center space-y-2">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            All music data, artwork, and metadata are property of Spotify and its partners.
          </p>
          <p class="text-xs text-neutral-400 dark:text-neutral-500">
            This app is not affiliated with Spotify. Spotify is a trademark of Spotify AB.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
