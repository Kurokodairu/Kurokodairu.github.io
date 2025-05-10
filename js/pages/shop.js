const supabaseUrl = 'https://pmsgkdkyvowdqirnlquc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtc2drZGt5dm93ZHFpcm5scXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzE3ODYsImV4cCI6MjA2MjIwNzc4Nn0.mpi2eMEOwfWBuA_7VeIp41N3pdedSrp5XacJ5CMIpDo';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// DOM elements
let currentUser = null;
const addSessionBtn = document.getElementById('add-session-btn');
const showAllSessionsBtn = document.getElementById('show-all-sessions');
const delSessionBtn = document.getElementById('open-delete-session-modal');
const pointsDisplay = document.getElementById('points');
const sessionList = document.getElementById('session-list');
const allSessionList = document.getElementById('all-session-list');
const googleLoginBtn = document.getElementById('google-login-btn'); // Your Google sign-in button 
const userDisplayElement = document.getElementById('user-display') || document.createElement('div'); // Element to show current user

// --- UI helpers ---
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
  addSessionBtn.classList.toggle('is-disabled', !enabled);
  showAllSessionsBtn.classList.toggle('is-disabled', !enabled);
  delSessionBtn.classList.toggle('is-disabled', !enabled);
}

// --- Auth logic ---
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
  setSessionButtonsState(!!user);
  
  if (user) {
    // Check if user exists in users table, create if not
    await ensureUserExists(user);
    showNotification(`Logget inn som ${user.email}`, 'success');
    await updatePointDisplay();
    await fetchRecentSessions();
  } else {
    pointsDisplay.textContent = '0';
    sessionList.innerHTML = '';
    allSessionList.innerHTML = '';
  }
}

// Make sure user exists in our database
async function ensureUserExists(user) {
  if (!user) return;
  
  // First check if user exists
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  // If user doesn't exist, create them with 0 points
  if (error || !data) {
    await supabase.from('users').insert([{
      id: user.id,
      points: 0
    }]);
  }
}

// Google login button
googleLoginBtn.onclick = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin // Ensure redirect back to this page
      }
    });
    
    if (error) {
      showNotification('Login failed: ' + error.message, 'error');
    }
  } catch (err) {
    showNotification('Login error: ' + err.message, 'error');
  }
};

// Add logout button functionality
const logoutBtn = document.getElementById('logout-btn') || document.createElement('button');
if (!document.body.contains(logoutBtn)) {
  logoutBtn.id = 'logout-btn';
  logoutBtn.textContent = 'Logg ut';
  logoutBtn.style.display = 'none';
  document.body.appendChild(logoutBtn);
}

logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  showNotification('Du har blitt logget ut', 'info');
};

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null;
  logoutBtn.style.display = currentUser ? 'block' : 'none';
  checkAuth();
});

// --- Points ---
async function updatePointDisplay() {
  if (!currentUser) {
    pointsDisplay.textContent = '0';
    return;
  }
  pointsDisplay.textContent = await getPoints();
}

async function getPoints() {
  const { data, error } = await supabase
    .from('users')
    .select('points')
    .eq('id', currentUser.id)
    .single();
  if (error || !data) return 0;
  return Number(data.points);
}

async function updatePoints(change) {
  const newScore = (await getPoints() || 0) + change;
  const { error } = await supabase
    .from('users')
    .update({ points: newScore })
    .eq('id', currentUser.id);
  if (!error) {
    await updatePointDisplay();
    showNotification(`${change > 0 ? '+' : ''}${change} poeng`, change > 0 ? 'success' : 'warning');
  } else {
    showNotification('Feil ved oppdatering av poeng: ' + error.message, 'error');
  }
}

// --- Sessions: Fetch and render ---
async function fetchRecentSessions() {
  // Show all recent sessions from everyone, no login required
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .gte('created_at', lastWeek.toISOString())
    .order('created_at', { ascending: false });
  
  if (error) {
    showNotification('Feil ved henting av økter: ' + error.message, 'error');
    return;
  }
  renderSessionList(sessionList, data);
}

async function fetchAllSessions() {
  if (!currentUser) {
    allSessionList.innerHTML = '';
    return;
  }
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    showNotification('Feil ved henting av alle økter: ' + error.message, 'error');
    return;
  }
  renderSessionList(allSessionList, data);
}

async function getUserName(userId) {
  // For backward compatibility with the old system 
  if (userId === 'j') return 'Jørgen';
  if (userId === 't') return 'Trine';
  
  // For Google login users, try to get user info
  try {
    // Check if the current user is the same as the userId we're looking up
    if (currentUser && currentUser.id === userId) {
      return currentUser.user_metadata?.full_name || currentUser.email || userId;
    }
    
    // Get from auth metadata if possible
    const { data: { user } } = await supabase.auth.getUser(userId);
    if (user) {
      return user.user_metadata?.full_name || user.email || userId;
    }
  } catch (e) {
    // Silently fail and return userId if we can't get the user name
  }
  
  return userId;
}

function renderSessionList(listElem, sessions) {
  listElem.innerHTML = '';
  if (!sessions || !sessions.length) {
    listElem.innerHTML = '<li style="color:#888;">Ingen økter funnet.</li>';
    return;
  }
  
  // Create async function to render all sessions
  const renderSessions = async () => {
    for (const session of sessions) {
      const userName = await getUserName(session.user_id);
      const date = new Date(session.created_at).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
      const varighet = session.varighet ? `${session.varighet}${typeof session.varighet === 'number' ? ' min' : ''}` : '';
      const type = session.type || '';
      const dotClass = getDotClass(type);
      const badge = getTypeBadge(type);
      const durationHtml = varighet ? `<span class="session-divider">•</span><span class="session-duration">${varighet}</span>` : '';
      
      const listItem = document.createElement('li');
      listItem.className = 'session-item';
      listItem.innerHTML = `
        <div class="session-meta">
          <span class="session-dot ${dotClass}"></span>
          <span class="session-date">${date}</span>
          ${durationHtml}
          <div class="session-id">${session.id}</div>
        </div>
        <div class="session-desc">
          [${userName}] ${session.title}${session.desc ? ': ' + session.desc : ''}
          ${badge}
        </div>
      `;
      listElem.appendChild(listItem);
    }
  };
  
  // Call the async function
  renderSessions();
}

// --- Add session ---
async function addSession(session) {
  try {
    const { error } = await supabase.from('sessions').insert([
      {
        user_id: currentUser.id,
        title: session.title,
        desc: session.desc,
        type: session.type,
        varighet: session.varighet
      }
    ]);
    
    if (error) {
      showNotification('Error adding session: ' + error.message, 'error');
      return;
    }
    
    await updatePoints(1);
    await fetchRecentSessions();
    showNotification('Økt lagt til!', 'success');
  } catch (err) {
    showNotification('Error: ' + err.message, 'error');
  }
}

// --- Modal logic and event listeners ---
function showModal(id) {
  document.getElementById(id).classList.add('visible');
}

function hideModal(id) {
  document.getElementById(id).classList.remove('visible');
}

addSessionBtn.onclick = () => {
  if (addSessionBtn.classList.contains('is-disabled')) {
    showNotification("Logg inn først", "error");
    return;
  }
  showModal('add-session-modal');
};

showAllSessionsBtn.onclick = async () => {
  if (addSessionBtn.classList.contains('is-disabled')) {
    showNotification("Logg inn først", "error");
    return;
  }
  await fetchAllSessions();
  showModal('session-modal');
};

document.querySelectorAll('.close').forEach(btn => {
  btn.onclick = (e) => {
    const modal = btn.closest('.modal');
    if (modal) modal.classList.remove('visible');
  };
});

window.onclick = function(event) {
  document.querySelectorAll('.modal.visible').forEach(modal => {
    if (event.target === modal) modal.classList.remove('visible');
  });
};

document.getElementById('save-session').onclick = async () => {
  const title = document.getElementById('session-title').value;
  const type = document.getElementById('session-type').value;
  const desc = document.getElementById('session-desc').value;
  const varighet = document.getElementById('session-varighet').value;
  
  if (!title || !type || !desc) {
    showNotification('Fyll ut alle feltene', 'warning');
    return;
  }
  
  await addSession({
    title,
    desc,
    type,
    varighet: varighet ? Number(varighet.replace(/[^\d]/g, '')) : null,
  });
  
  // Clear form fields
  document.getElementById('session-title').value = '';
  document.getElementById('session-type').value = '';
  document.getElementById('session-desc').value = '';
  document.getElementById('session-varighet').value = '';
  
  hideModal('add-session-modal');
};

// Delete session modal
delSessionBtn.onclick = () => {
  if (delSessionBtn.classList.contains('is-disabled')) {
    showNotification("Logg inn først", "error");
    return;
  }
  document.getElementById('delete-session-modal').classList.add('visible');
};

document.getElementById('delete-session-confirm').onclick = async () => {
  const id = document.getElementById('delete-session-id').value;
  if (!id) {
    showNotification('Skriv inn en økt-ID', 'warning');
    return;
  }
  if (!currentUser) {
    showNotification('Du må logge inn først', 'error');
    return;
  }
  if (!confirm(`Er du sikker på at du vil slette økt med ID ${id}?`)) return;
  
  const { data, error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id)
    .select();
    
  if (error) {
    showNotification('Kunne ikke slette økten: ' + error.message, 'error');
    return;
  }
  
  if (data && data.length === 0) {
    showNotification('Ingen økt med denne ID-en, eller ikke din økt.', 'warning');
  } else {
    showNotification('Økt slettet', 'success');
    await updatePoints(-1);
    document.getElementById('delete-session-id').value = '';
    document.getElementById('delete-session-modal').classList.remove('visible');
    await fetchRecentSessions();
    await fetchAllSessions();
  }
};

// Notification logic
function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById('notification-container');
  if (!container) {
    console.error('Notification container not found');
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close" aria-label="Lukk">&times;</button>
  `;
  toast.querySelector('.toast-close').onclick = () => container.removeChild(toast);
  
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, duration);
  
  container.appendChild(toast);
}

// --- Initial state ---
setSessionButtonsState(false);
fetchRecentSessions(); // Load recent sessions immediately, no login required
checkAuth(); // Check auth status on page load