<template>
  <section id="sessions">
    <div class="sessions-header">
      <div class="sessions-title">
        <Icon name="lucide:calendar-clock" />
        <h2>Ukas økter</h2>
      </div>
      <div class="sessions-actions">
        <button 
          class="sessions-tab active" 
          :class="{ 'is-disabled': !isLoggedIn }"
          @click="openMySessionsModal"
        >
          Mine økter
        </button>
        <button 
          class="add-session-btn"
          :class="{ 'is-disabled': !isLoggedIn }"
          @click="openAddSessionModal"
        >
          Legg til økt
        </button>
      </div>
    </div>
    
    <ul class="session-list">
      <SessionItem
        v-for="session in recentSessions"
        :key="session.id"
        :session="session"
      />
      <li v-if="recentSessions.length === 0 && !isLoading" style="color:#888;">
        Ingen økter funnet.
      </li>
    </ul>

    <div class="session-delete-row">
      <button 
        class="delete-session-trigger"
        :class="{ 'is-disabled': !isLoggedIn }"
        @click="openDeleteSessionModal"
      >
        Slett økt
      </button>
      <button 
        v-if="isLoggedIn"
        class="delete-session-trigger"
        @click="logout"
      >
        Logg ut
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isLoggedIn, logout } = useAuth()
const { recentSessions, isLoading, fetchRecentSessions } = useSessions()

const showMySessionsModal = useState('modals.mySessions', () => false)
const showAddSessionModal = useState('modals.addSession', () => false)
const showDeleteSessionModal = useState('modals.deleteSession', () => false)

const openMySessionsModal = () => {
  if (!isLoggedIn.value) {
    useNotification().show("Logg inn først", "error")
    return
  }
  showMySessionsModal.value = true
}

const openAddSessionModal = () => {
  if (!isLoggedIn.value) {
    useNotification().show("Logg inn først", "error")
    return
  }
  showAddSessionModal.value = true
}

const openDeleteSessionModal = () => {
  if (!isLoggedIn.value) {
    useNotification().show("Logg inn først", "error")
    return
  }
  showDeleteSessionModal.value = true
}

// Fetch recent sessions on mount
onMounted(() => {
  fetchRecentSessions()
})
</script>
