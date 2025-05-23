// modal.js

// Assumes showNotification, addSession, hideModal, supabaseClient, userId, fetchRecentSessions, fetchAllSessions, updatePoints are globally available
// from shop.js or other modules.

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('visible');
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('visible');
}

function initModalEventListeners() {
    // Add session modal button
    const addSessionBtn = document.getElementById('add-session-btn');
    if (addSessionBtn) {
        addSessionBtn.onclick = () => {
            if (addSessionBtn.classList.contains('is-disabled')) {
                if (typeof showNotification === 'function') showNotification("Logg inn først", "error");
                return;
            }
            showModal('add-session-modal');
        }
    }

    // Show all sessions modal button
    const showAllSessionsBtn = document.getElementById('show-all-sessions');
    if (showAllSessionsBtn) {
        showAllSessionsBtn.onclick = async () => {
            if (showAllSessionsBtn.classList.contains('is-disabled')) { // Corrected to check showAllSessionsBtn
                if (typeof showNotification === 'function') showNotification("Logg inn først", "error");
                return;
            }
            if (typeof fetchAllSessions === 'function') await fetchAllSessions();
            showModal('session-modal');
        };
    }

    // Generic close buttons for all modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.onclick = (e) => {
            const modalId = btn.dataset.modal; // Assumes data-modal attribute on close buttons
            if (modalId) {
                hideModal(modalId);
            } else {
                // Fallback for modals without data-modal attribute, if any
                const modal = btn.closest('.modal');
                if (modal) modal.classList.remove('visible');
            }
        };
    });

    // Click outside modal to close
    window.onclick = function(event) {
        document.querySelectorAll('.modal.visible').forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('visible');
            }
        });
    };

    // Save session button in add-session-modal
    const saveSessionBtn = document.getElementById('save-session');
    if (saveSessionBtn) {
        saveSessionBtn.onclick = async () => {
            const title = document.getElementById('session-title').value;
            const type = document.getElementById('session-type').value;
            const desc = document.getElementById('session-desc').value;
            const varighetRaw = document.getElementById('session-varighet').value;
            const varighetSanitized = varighetRaw.replace(/[^\d]/g, '');

            if (!title.trim() || type === "Velg øktype" || !desc.trim() || !varighetSanitized) {
                if (typeof showNotification === 'function') {
                    showNotification('Fyll ut tittel, type, beskrivelse og varighet (kun tall).', 'warning');
                }
                return;
            }
            
            if (typeof addSession === 'function') {
                await addSession({
                    title: title.trim(),
                    desc: desc.trim(),
                    type,
                    varighet: Number(varighetSanitized),
                });
            }
            hideModal('add-session-modal');
        };
    }

    // Open delete session modal button
    const openDeleteModalBtn = document.getElementById('open-delete-session-modal');
    const delSessionBtn = document.getElementById('open-delete-session-modal'); // Used for is-disabled check

    if (openDeleteModalBtn && delSessionBtn) {
        openDeleteModalBtn.onclick = () => {
            if (delSessionBtn.classList.contains('is-disabled')) {
                if (typeof showNotification === 'function') showNotification("Logg inn først", "error");
                return;
            }
            showModal('delete-session-modal');
        };
    }

    // Confirm delete session button
    const deleteConfirmBtn = document.getElementById('delete-session-confirm');
    if (deleteConfirmBtn) {
        deleteConfirmBtn.onclick = async () => {
            const id = document.getElementById('delete-session-id').value;
            if (!id) {
                if (typeof showNotification === 'function') showNotification('Skriv inn en økt-ID', 'warning');
                return;
            }
            if (!userId) { // userId is a global variable from shop.js
                if (typeof showNotification === 'function') showNotification('Du må logge inn først', 'error');
                return;
            }
            if (!confirm(`Er du sikker på at du vil slette økt med ID ${id}?`)) return;

            const { data, error } = await supabaseClient // supabaseClient is global from shop.js
                .from('sessions')
                .delete()
                .eq('id', id)
                .eq('user_id', userId)
                .select();

            if (error) {
                if (typeof showNotification === 'function') showNotification('Kunne ikke slette økten: ' + error.message, 'error');
                return;
            }
            if (data.length === 0) {
                if (typeof showNotification === 'function') showNotification('Ingen økt med denne ID-en, eller ikke din økt.', 'warning');
            } else {
                console.log(data);
                if (typeof showNotification === 'function') showNotification('Økt slettet', 'success');
                if (typeof updatePoints === 'function') await updatePoints(userId, -1);
                hideModal('delete-session-modal');
                if (typeof fetchRecentSessions === 'function') await fetchRecentSessions();
                if (typeof fetchAllSessions === 'function') await fetchAllSessions();
            }
        };
    }
}
