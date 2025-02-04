<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <!-- Total Time Listened -->
      <StatCard
        title="Time Listened"
        value="247h"
        subtitle="Last 6 months"
        :icon="clockIcon"
      />

      <!-- Top Genre -->
      <StatCard
        title="Top Genre"
        value="Pop"
        subtitle="38% of listening time"
        :icon="musicIcon"
      />

      <!-- Top Artist -->
      <StatCard
        title="Top Artist"
        value="Taylor Swift"
        subtitle="127 plays this month"
        :icon="userIcon"
      />

      <!-- Most Active Day -->
      <StatCard
        title="Peak Time"
        value="9PM"
        subtitle="Most active listening hour"
        :icon="chartIcon"
      />
    </div>

    <!-- Recent Activity Chart -->
    <StatCard title="Listening Activity">
      <div class="h-64 bg-neutral-50 rounded-lg border border-neutral-200 p-4">
        <div class="h-full flex items-end justify-between space-x-2">
          <div v-for="(height, index) in activityData" :key="index"
               class="w-8 bg-green-500 rounded-t"
               :style="{ height: height + '%' }">
          </div>
        </div>
      </div>
      <div class="flex justify-between mt-2 text-sm text-neutral-500">
        <span v-for="day in weekDays" :key="day">{{ day }}</span>
      </div>
    </StatCard>

    <!-- Top Tracks Preview -->
    <StatCard title="Current Top Tracks">
      <div class="space-y-4">
        <div v-for="(track, index) in topTracks" :key="track.id"
             class="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors">
          <div class="flex items-center space-x-3">
            <span class="text-neutral-400">{{ index + 1 }}</span>
            <div>
              <p class="font-medium text-neutral-800">{{ track.title }}</p>
              <p class="text-sm text-neutral-500">{{ track.artist }}</p>
            </div>
          </div>
          <span class="text-sm text-neutral-500">{{ track.duration }}</span>
        </div>
      </div>
    </StatCard>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatCard from '../common/StatCard.vue'

// Icons
const clockIcon = 'M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z'
const musicIcon = 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
const userIcon = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const chartIcon = 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'

// Activity data
const activityData = ref([40, 65, 85, 55, 75, 45, 90])
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Top tracks data
const topTracks = ref([
  { id: 1, title: 'Cruel Summer', artist: 'Taylor Swift', duration: '3:42' },
  { id: 2, title: 'Flowers', artist: 'Miley Cyrus', duration: '3:21' },
  { id: 3, title: 'Anti-Hero', artist: 'Taylor Swift', duration: '3:20' }
])
</script> 