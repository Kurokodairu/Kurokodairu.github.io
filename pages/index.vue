<template>
  <div>
    <ShopSection />
    <SessionsSection />
  </div>
</template>

<script setup lang="ts">
// Set page meta
useHead({
  title: 'Treningslogg',
  meta: [
    { name: 'description', content: 'Treningslogg' }
  ]
})

// Fetch sessions on page load
const { fetchRecentSessions } = useSessions()

onMounted(() => {
  fetchRecentSessions()
})
</script>
