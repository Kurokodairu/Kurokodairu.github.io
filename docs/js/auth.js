// auth.js

// Assumes supabase, setSessionButtonsState, updatePointDisplay, fetchMySessions,
// googleLoginBtn, logoutBtn, showNotification, allSessionList, pointsDisplay are globally available
// from shop.js, and shop.js manages the userId variable.

async function handleUserSession(session) {
  if (session && session.user) {
    userId = session.user.id; // userId is a global variable from shop.js
    setSessionButtonsState(true);
    await updatePointDisplay(userId);
    await fetchMySessions();

    if (logoutBtn) logoutBtn.style.display = 'block';
    if (googleLoginBtn) {
      googleLoginBtn.innerHTML = `<i class="lucide lucide-user-check"></i> ${session.user.email}`;
      googleLoginBtn.disabled = true;
    }
  } else {
    userId = null;
    setSessionButtonsState(false);
    if (pointsDisplay) pointsDisplay.textContent = '0';
    if (allSessionList) allSessionList.innerHTML = '<li style="color:#888;">Logg inn for å se dine økter.</li>';
    
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (googleLoginBtn) {
      googleLoginBtn.innerHTML = '<i class="lucide lucide-google"></i> Logg inn med Google';
      googleLoginBtn.disabled = false;
    }
  }
}

function initAuthEventListeners() {
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            if (googleLoginBtn.disabled) return; // Already logged in or processing
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: window.location.origin
                }
            });
            if (error) {
                console.error('Login error: ' + error.message);
                showNotification('Login feil: ' + error.message, 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error.message);
                showNotification('Feil ved utlogging: ' + error.message, 'error');
            } else {
                showNotification('Du er nå logget ut.', 'info');
            }
        });
    }
}
