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

// Initialize data on page load
const { user } = useAuth()
const { fetchRecentSessions } = useSessions()

onMounted(() => {
  fetchRecentSessions()
})
</script>
