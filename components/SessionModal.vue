<template>
  <div 
    v-if="showMySessionsModal" 
    class="modal visible"
    @click="closeOnBackdrop"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Mine økter</h2>
        <span class="close" @click="close">&times;</span>
      </div>
      <div class="modal-body">
        <ul class="session-list">
          <SessionItem
            v-for="session in mySessions"
            :key="session.id"
            :session="session"
          />
          <li v-if="mySessions.length === 0 && !isLoading" style="color:#888;">
            {{ isLoggedIn ? 'Ingen økter funnet.' : 'Logg inn for å se dine økter.' }}
          </li>
        </ul>
      </div>
      <div class="modal-footer">
        <button class="close" @click="close">Lukk</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()
const { mySessions, isLoading, fetchMySessions } = useSessions()

const showMySessionsModal = useState('modals.mySessions', () => false)

const close = () => {
  showMySessionsModal.value = false
}

const closeOnBackdrop = (event: Event) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

// Fetch user sessions when modal opens
watch(showMySessionsModal, (isOpen) => {
  if (isOpen && isLoggedIn.value) {
    fetchMySessions()
  }
})
</script>
