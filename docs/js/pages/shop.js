// shop.js
const supabaseUrl = 'https://pmsgkdkyvowdqirnlquc.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtc2drZGt5dm93ZHFpcm5scXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzE3ODYsImV4cCI6MjA2MjIwNzc4Nn0.mpi2eMEOwfWBuA_7VeIp41N3pdedSrp5XacJ5CMIpDo';
const supabase = supabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
  : window.supabaseClient;

// DOM elements
let userId = null;
const userIdInput = document.getElementById('userID');
const addSessionBtn = document.getElementById('add-session-btn');
const showAllSessionsBtn = document.getElementById('show-all-sessions');
const delSessionBtn = document.getElementById('open-delete-session-modal');
const pointsDisplay = document.getElementById('points');
const sessionList = document.getElementById('session-list');
const allSessionList = document.getElementById('all-session-list');

addSessionBtn.classList.add('is-disabled');
showAllSessionsBtn.classList.add('is-disabled');
delSessionBtn.classList.add('is-disabled');

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

// --- User login ---
async function handleUserLogin() {
  const val = userIdInput.value.trim();
  userId = val;
  setSessionButtonsState(!!val);
  if (userId) {
    switch (userId) {
      case 'j':
        showNotification('Jørgen', 'success');
        break;
      case 't':
        showNotification('Trine', 'success');
        break;
    }
  }
  await updatePointDisplay(userId);
}

// --- Event listeners for login ---
userIdInput?.addEventListener('keyup', async (event) => {
  if (event.key === 'Enter') await handleUserLogin();
});
document.getElementById('idButton')?.addEventListener('click', handleUserLogin);

// --- Points ---
async function updatePointDisplay(userId) {
  if (!userId) {
    pointsDisplay.textContent = '0';
    return;
  }
  pointsDisplay.textContent = await getPoints(userId);
}
async function getPoints(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('points')
    .eq('name', userId)
    .single();
  if (error || !data) return 0;
  return Number(data.points);
}
async function updatePoints(userId, change) {
  const newScore = (await getPoints(userId) || 0) + change;
  if (change > 0) {
    const { error } = await supabase
    .from('users')
    .update({ points: newScore })
    .eq('name', userId);
    if (!error) {
      await updatePointDisplay(userId);
      showNotification(`+${change} poeng`, 'success');
    }
  } else if (change < 0) {
    const { error } = await supabase
      .from('users')
      .update({ points: newScore })
      .eq('name', userId);
    if (!error) {
      await updatePointDisplay(userId);
      showNotification(`${change} poeng`, 'warning');
    }
  }
}

// --- Sessions: Fetch and render ---
async function fetchRecentSessions() {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .gte('created_at', lastWeek.toISOString())
    .order('created_at', { ascending: false });
  if (error) return;
  renderSessionList(sessionList, data);
}
async function fetchAllSessions() {
  if (!userId) {
    allSessionList.innerHTML = '';
    return;
  }
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
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
    const durationOrL = varighet || (session.varighet === 0 ? '0 min' : '');
    const durationHtml = durationOrL ? `<span class="session-divider">•</span><span class="session-duration">${durationOrL}</span>` : '';
    listElem.innerHTML += `
      <li>
        <div class="session-meta">
          <span class="session-dot ${dotClass}"></span>
          <span class="session-date">${date}</span>
          ${durationHtml}
          <div class="session-id">${session.id}</div>
        </div>
        <div class="session-desc">
          [${session.user_id == "j" ? "Jørgen" : session.user_id == "t" ? "Trine" : session.user_id}] ${session.title}${session.desc ? ': ' + session.desc : ''}
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
      user_id: userId,
      title: session.title,
      desc: session.desc,
      type: session.type,
      varighet: session.varighet
    }
  ]);
  if (error) return alert('Error adding session');
  await updatePoints(userId, 1);
  await fetchRecentSessions();
  await fetchAllSessions();
}

// --- Modal logic ---
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
}
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

// --- Add session modal logic ---
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

// delete session modal
// Open the delete session modal
document.getElementById('open-delete-session-modal').onclick = () => {
  if (delSessionBtn.classList.contains('is-disabled')) {
    showNotification("Logg inn først", "error");
    return;
  }
  document.getElementById('delete-session-modal').classList.add('visible');
};
// Confirm delete
document.getElementById('delete-session-confirm').onclick = async () => {
  const id = document.getElementById('delete-session-id').value;
  if (!id) {
    showNotification('Skriv inn en økt-ID', 'warning');
    return;
  }
  if (!userId) {
    showNotification('Du må logge inn først', 'error');
    return;
  }
  // Confirm with user
  if (!confirm(`Er du sikker på at du vil slette økt med ID ${id}?`)) return;

  // Delete from Supabase
  const { data, error } = await supabaseClient
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select();
    if (error) {
      showNotification('Kunne ikke slette økten', 'error');
    return;
  } if (data.length === 0) {
    showNotification('Ingen økt med denne ID-en, eller ikke din økt.', 'warning');
  } else {
      console.log(data);
      showNotification('Økt slettet');
      updatePoints(userId, -1);
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
  // Close on click
  toast.querySelector('.toast-close').onclick = () => container.removeChild(toast);
  // Auto-close
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, duration);
  container.appendChild(toast);

}

// --- Initial state ---
setSessionButtonsState(false);
fetchRecentSessions();
