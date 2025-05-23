// shop.js
const supabaseUrl = 'https://pmsgkdkyvowdqirnlquc.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtc2drZGt5dm93ZHFpcm5scXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzE3ODYsImV4cCI6MjA2MjIwNzc4Nn0.mpi2eMEOwfWBuA_7VeIp41N3pdedSrp5XacJ5CMIpDo';
const supabase = supabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
  : window.supabaseClient;

// --- Global variables ---
let userId = null;

// --- DOM elements (globally accessible for modules) ---
const googleLoginBtn = document.getElementById('google-login-btn');
const addSessionBtn = document.getElementById('add-session-btn');
const showAllSessionsBtn = document.getElementById('show-all-sessions');
const delSessionBtn = document.getElementById('open-delete-session-modal');
const pointsDisplay = document.getElementById('points');
const sessionList = document.getElementById('session-list');
const allSessionList = document.getElementById('all-session-list');
const logoutBtn = document.getElementById('logout-btn');

// --- UI helpers (can be moved to a ui.js if they grow) ---
function getTypeBadge(type) {
  if (!type) return '';
  let badgeClass = '';
  let label = '';
  switch (type.toLowerCase()) {
    case 'pilates':
      badgeClass = 'pilates';
      label = 'Pilates';
      break;
    case 'vann':
      badgeClass = 'vann';
      label = 'Vann';
      break;
    case 'styrke':
      badgeClass = 'styrke';
      label = 'Styrke';
      break;
    default:
      badgeClass = 'annet';
      label = 'Annet';
  }
  return `<span class="session-badge ${badgeClass}">${label}</span>`;
}

function getDotClass(type) {
  if (!type) return '';
  switch (type.toLowerCase()) {
    case 'pilates': return 'pilates';
    case 'vann': return 'vann';
    case 'styrke': return 'styrke';
    default: return 'annet';
  }
}

function setSessionButtonsState(enabled) {
  if (addSessionBtn) addSessionBtn.classList.toggle('is-disabled', !enabled);
  if (showAllSessionsBtn) showAllSessionsBtn.classList.toggle('is-disabled', !enabled);
  if (delSessionBtn) delSessionBtn.classList.toggle('is-disabled', !enabled);
}

// --- Points Logic ---
async function updatePointDisplay(currentUserId) {
  if (!currentUserId) {
    if (pointsDisplay) pointsDisplay.textContent = '0';
    return;
  }
  if (pointsDisplay) pointsDisplay.textContent = await getPoints(currentUserId);
}

async function getPoints(currentUserId) {
  const { data, error } = await supabase
    .from('users')
    .select('points')
    .eq('id', currentUserId)
    .single();
  if (error || !data) return 0;
  return Number(data.points);
}

async function updatePoints(currentUserId, change) {
  const currentPoints = await getPoints(currentUserId);
  const numericCurrentPoints = (typeof currentPoints === 'number' && !isNaN(currentPoints)) ? currentPoints : 0;
  const newScore = numericCurrentPoints + change;

  const { error } = await supabase
    .from('users')
    .update({ points: newScore })
    .eq('id', currentUserId);

  if (!error) {
    await updatePointDisplay(currentUserId);
    if (typeof showNotification === 'function') {
        showNotification(change > 0 ? `+${change} poeng` : `${change} poeng`, change > 0 ? 'success' : 'warning');
    }
  } else {
    console.error('Error updating points:', error.message);
    if (typeof showNotification === 'function') showNotification('Feil ved oppdatering av poeng.', 'error');
  }
}

// --- Sessions: Fetch and render ---
async function fetchRecentSessions() {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const { data, error } = await supabase
    .from('sessions')
    .select('*, users(name)')
    .gte('created_at', lastWeek.toISOString())
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching recent sessions:', error.message);
    return;
  }
  if (sessionList) renderSessionList(sessionList, data);
}

async function fetchAllSessions() {
  if (!userId) { // Uses global userId
    if (allSessionList) allSessionList.innerHTML = '<li style="color:#888;">Logg inn for å se dine økter.</li>';
    return;
  }
  const { data, error } = await supabase
    .from('sessions')
    .select('*, users(name)')
    .eq('user_id', userId) // Uses global userId
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching all sessions:', error.message);
    if (allSessionList) allSessionList.innerHTML = '<li style="color:red;">Kunne ikke laste økter.</li>';
    return;
  }
  if (allSessionList) renderSessionList(allSessionList, data);
}

function renderSessionList(listElem, sessions) {
  if (!listElem) return;
  listElem.innerHTML = '';
  if (!sessions || !sessions.length) {
    listElem.innerHTML = '<li style="color:#888;">Ingen økter funnet.</li>';
    return;
  }
  sessions.forEach(session => {
    const date = new Date(session.created_at).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
    const varighet = session.varighet ? `${session.varighet}${typeof session.varighet === 'number' ? ' min' : ''}` : '';
    const type = session.type || '';
    const dotClass = getDotClass(type);
    const badge = getTypeBadge(type);
    const durationOrL = varighet || (session.varighet === 0 ? '0 min' : '');
    const durationHtml = durationOrL ? `<span class="session-divider">•</span><span class="session-duration">${durationOrL}</span>` : '';
    const displayName = (session.users && session.users.name) ? session.users.name : "Bruker";

    listElem.innerHTML += `
      <li>
        <div class="session-meta">
          <span class="session-dot ${dotClass}"></span>
          <span class="session-date">${date}</span>
          ${durationHtml}
          <div class="session-id">${session.id}</div>
        </div>
        <div class="session-desc">
          [${displayName}] ${session.title}${session.desc ? ': ' + session.desc : ''}
          ${badge}
        </div>
      </li>
    `;
  });
}

// --- Add session (called from modal.js) ---
async function addSession(sessionData) {
  if (!userId) { // Uses global userId
    if (typeof showNotification === 'function') showNotification('Du må være logget inn for å legge til økt', 'error');
    return;
  }
  const { error } = await supabase.from('sessions').insert([
    {
      user_id: userId, // Uses global userId
      title: sessionData.title,
      desc: sessionData.desc,
      type: sessionData.type,
      varighet: sessionData.varighet
    }
  ]);
  if (error) {
    if (typeof showNotification === 'function') showNotification('Feil ved lagring av økt: ' + error.message, 'error');
    return;
  }
  await updatePoints(userId, 1); // Uses global userId
  await fetchRecentSessions();
  await fetchAllSessions();
}

// --- Notification logic (can be moved to a ui.js or notification.js) ---
function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById('notification-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" aria-label="Lukk">&times;</button>
  `;
  toast.querySelector('.toast-close').onclick = () => {
      if (container.contains(toast)) container.removeChild(toast);
  }
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, duration);
  container.appendChild(toast);
}

// --- Initial state and event listeners setup ---
function initializeApp() {
    // Initial button states
    if (addSessionBtn) addSessionBtn.classList.add('is-disabled');
    if (showAllSessionsBtn) showAllSessionsBtn.classList.add('is-disabled');
    if (delSessionBtn) delSessionBtn.classList.add('is-disabled');
    if (logoutBtn) logoutBtn.style.display = 'none';

    // Initialize authentication event listeners (from auth.js)
    if (typeof initAuthEventListeners === 'function') initAuthEventListeners();
    
    // Initialize modal event listeners (from modal.js)
    if (typeof initModalEventListeners === 'function') initModalEventListeners();

    // Check for session on page load (auth.js function will handle UI updates)
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (typeof handleUserSession === 'function') handleUserSession(session);
        fetchRecentSessions(); // Fetch recent public sessions regardless of login state
    });

    // Listen for auth state changes (auth.js function will handle UI updates)
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (typeof handleUserSession === 'function') await handleUserSession(session);
        // Potentially re-fetch recent sessions if the view should change based on auth state
        // For now, assuming fetchRecentSessions shows public data and is called on DOMContentLoaded.
        // If auth state change should also refresh this, add: await fetchRecentSessions();
    });
}

// --- Run initial setup ---
document.addEventListener('DOMContentLoaded', initializeApp);
