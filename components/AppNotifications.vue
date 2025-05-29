<template>
  <div id="notification-container" class="notification-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="[
        'toast-notification',
        `toast-${notification.type}`
      ]"
    >
      <span>{{ notification.message }}</span>
      <button 
        class="toast-close" 
        aria-label="Lukk"
        @click="removeNotification(notification.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NotificationItem {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const notifications = useState<NotificationItem[]>('notifications', () => [])

const removeNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// Auto-remove notifications after their duration
watch(notifications, (newNotifications) => {
  newNotifications.forEach((notification) => {
    setTimeout(() => {
      removeNotification(notification.id)
    }, notification.duration)
  })
}, { deep: true })
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 5rem;
  right: 1rem;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 700px) {
  .notification-container {
    top: 9rem;
    right: 0.5rem;
  }
}
</style>
