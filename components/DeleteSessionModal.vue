<template>
  <div 
    v-if="showDeleteSessionModal" 
    class="modal visible"
    @click="closeOnBackdrop"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Slett økt</h2>
        <span class="close" @click="close">&times;</span>
      </div>
      <div class="modal-body">
        <label for="delete-session-id">Session ID</label>
        <input 
          id="delete-session-id"
          v-model.number="sessionId" 
          class="modal-input" 
          type="number" 
          min="1" 
          placeholder="F.eks. 123" 
        />
      </div>
      <div class="modal-footer">
        <button class="close" @click="close">Avbryt</button>
        <button class="modal-save" @click="confirmDelete">Slett</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { deleteSession } = useSessions()

const showDeleteSessionModal = useState('modals.deleteSession', () => false)
const sessionId = ref<number | null>(null)

const close = () => {
  showDeleteSessionModal.value = false
  sessionId.value = null
}

const closeOnBackdrop = (event: Event) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

const confirmDelete = async () => {
  if (!sessionId.value || sessionId.value <= 0) {
    useNotification().show('Skriv inn en gyldig session ID', 'warning')
    return
  }

  const success = await deleteSession(sessionId.value)
  if (success) {
    close()
  }
}
</script>
