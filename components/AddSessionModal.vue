<template>
  <div 
    v-if="showAddSessionModal" 
    class="modal visible"
    @click="closeOnBackdrop"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Legg til økt</h2>
        <span class="close" @click="close">&times;</span>
      </div>
      <div class="modal-body">
        <label>Type økt</label>
        <select v-model="formData.type" class="modal-input">
          <option value="">Velg øktype</option>
          <option value="Pilates">Pilates</option>
          <option value="Styrke">Styrke</option>
          <option value="Annet">Annet</option>
          <option value="Vann">Vann</option>
        </select>
        
        <label>Tittel</label>
        <input 
          v-model="formData.title" 
          class="modal-input" 
          placeholder="Tittel" 
        />
        
        <label>Beskrivelse</label>
        <textarea 
          v-model="formData.desc" 
          class="modal-input" 
          placeholder="Beskriv din økt her..."
        ></textarea>
        
        <label>Varighet</label>
        <input 
          v-model="formData.varighet" 
          class="modal-input" 
          placeholder="f.eks. '45' for 45 minutter" 
        />
      </div>
      <div class="modal-footer">
        <button class="close" @click="close">Avbryt</button>
        <button class="modal-save" @click="saveSession">Lagre økt</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SessionData } from '~/composables/useSessions'

const { addSession } = useSessions()

const showAddSessionModal = useState('modals.addSession', () => false)

const formData = reactive({
  title: '',
  desc: '',
  type: '',
  varighet: ''
})

const close = () => {
  showAddSessionModal.value = false
  resetForm()
}

const closeOnBackdrop = (event: Event) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

const resetForm = () => {
  formData.title = ''
  formData.desc = ''
  formData.type = ''
  formData.varighet = ''
}

const saveSession = async () => {
  const varighetSanitized = formData.varighet.replace(/[^\d]/g, '')

  if (!formData.title.trim() || formData.type === '' || !formData.desc.trim() || !varighetSanitized) {
    useNotification().show('Fyll ut tittel, type, beskrivelse og varighet (kun tall).', 'warning')
    return
  }

  const sessionData: SessionData = {
    title: formData.title.trim(),
    desc: formData.desc.trim(),
    type: formData.type,
    varighet: Number(varighetSanitized)
  }

  const success = await addSession(sessionData)
  if (success) {
    close()
  }
}
</script>
