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
const googleLoginBtn = document.getElementById('g-id-signin'); // Your Google sign-in button

// --- UI helpers ---
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
    showNotification(`Logget inn som ${user.email}`, 'success');
    await updatePointDisplay();
    await fetchRecentSessions();
  } else {
    pointsDisplay.textContent = '0';
    sessionList.innerHTML = '';
    allSessionList.innerHTML = '';
  }
}

googleLoginBtn.onclick = async () => {
  await supabase.auth.signInWithOAuth({ state: state, provider: 'google' });
};

supabase.auth.onAuthStateChange((_event, session) => {
  
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
  }
}

// --- Sessions: Fetch and render ---
async function fetchRecentSessions() {
  if (!currentUser) {
    sessionList.innerHTML = '';
    return;
  }
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('created_at', lastWeek.toISOString())
    .order('created_at', { ascending: false });
  if (error) return;
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
  if (error) return;
  renderSessionList(allSessionList, data);
}

function renderSessionList(listElem, sessions) {
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
    const durationHtml = varighet ? `<span class="session-divider">•</span><span class="session-duration">${varighet}</span>` : '';
    listElem.innerHTML += `
      <li class="session-item">
        <div class="session-meta">
          <span class="session-dot ${dotClass}"></span>
          <span class="session-date">${date}</span>
          ${durationHtml}
          <div class="session-id">${session.id}</div>
        </div>
        <div class="session-desc">
          ${session.title}${session.desc ? ': ' + session.desc : ''}
          ${badge}
        </div>
      </li>
    `;
  });
}

// --- Add session ---
async function addSession(session) {
  const { error } = await supabase.from('sessions').insert([
    {
      user_id: currentUser.id,
      title: session.title,
      desc: session.desc,
      type: session.type,
      varighet: session.varighet
    }
  ]);
  if (error) return alert('Error adding session');
  await updatePoints(1);
  await fetchRecentSessions();
  await fetchAllSessions();
}

// --- Modal logic and event listeners ---
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
  if (!type || !desc) return alert('Fyll ut alle feltene');
  await addSession({
    title,
    desc,
    type,
    varighet: varighet ? Number(varighet.replace(/[^\d]/g, '')) : null,
  });
  hideModal('add-session-modal');
};

// delete session modal...
document.getElementById('open-delete-session-modal').onclick = () => {
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
    showNotification('Kunne ikke slette økten', 'error');
    return;
  }
  if (data.length === 0) {
    showNotification('Ingen økt med denne ID-en, eller ikke din økt.', 'warning');
  } else {
    showNotification('Økt slettet');
    await updatePoints(-1);
    document.getElementById('delete-session-modal').classList.remove('visible');
    await fetchRecentSessions();
    await fetchAllSessions();
  }
};

// Notification logic
function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById('notification-container');
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
checkAuth();
