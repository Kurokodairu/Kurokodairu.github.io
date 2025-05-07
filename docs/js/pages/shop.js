// shop.js
// Initialize Supabase client
const supabaseUrl = 'https://pmsgkdkyvowdqirnlquc.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtc2drZGt5dm93ZHFpcm5scXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzE3ODYsImV4cCI6MjA2MjIwNzc4Nn0.mpi2eMEOwfWBuA_7VeIp41N3pdedSrp5XacJ5CMIpDo';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

let userId = null;
const userIdInput = document.getElementById('userID');
const addSessionBtn = document.getElementById('add-session-btn');
const showAllSessionsBtn = document.getElementById('show-all-sessions');
const pointsDisplay = document.getElementById('points');
addSessionBtn.disabled = true;
showAllSessionsBtn.disabled = true;

// Add event listener for the search/input field
userIdInput?.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        let hasValue = userIdInput.value.trim() !== '';
        userId = userIdInput.value;
        addSessionBtn.disabled = !hasValue;
        showAllSessionsBtn.disabled = !hasValue;
        await updatePointDisplay(userId);
    }
});
// Add event listener for login button
document.getElementById('idButton')?.addEventListener('click', async () => {
    let hasValue = userIdInput.value.trim() !== '';
    userId = userIdInput.value;
    addSessionBtn.disabled = !hasValue;
    showAllSessionsBtn.disabled = !hasValue;
    await updatePointDisplay(userId);
});


// Get points from Supabase
async function updatePointDisplay(userId) {
    if (!userId) {
        pointsDisplay.textContent = 'Please enter a valid user ID.';
        return;
    }
    pointsDisplay.textContent = await getPoints(userId);
}

// get points as number
async function getPoints(userId) {
  const { data, error } = await supabaseClient
    .from('users')
    .select('points')
    .eq('name', userId)
    .single();

  if (error) {
    console.error('Error fetching points:', error);
    pointsDisplay.textContent = 'Error';
    return;
  }
  return Number(data.points);
}

// Update points in Supabase (call this when user buys something, etc.)
async function updatePoints(userId, change) {
    newScore = (await getPoints(userId) || 0) + change;
  const { error } = await supabaseClient
    .from('users')
    .update({ points: newScore })
    .eq('name', userId);

  if (error) {
    console.error('Error updating points:', error);
    return;
  }
  // Optionally refresh display
  await updatePointDisplay(userId);
}



// Fetch sessions from the last 7 days
async function fetchRecentSessions() {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const { data, error } = await supabaseClient
    .from('sessions')
    .select('*')
    .gte('created_at', lastWeek.toISOString())
    .order('created_at', { ascending: false });
  if (error) return console.error(error);
    renderSessionList('session-list', data);
}

// Fetch all sessions
async function fetchAllSessions() {
  const { data, error } = await supabaseClient
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return console.error(error);
  renderSessionList('all-session-list', data);
}

// Render session list
function renderSessionList(elementId, sessions) {
  const list = document.getElementById(elementId);
  list.innerHTML = '';
  sessions.forEach(session => {
    const li = document.createElement('li');
    li.textContent = `(${new Date(session.created_at).toLocaleDateString()}) | ${session.title}:  ${session.desc}`;
    list.appendChild(li);
  });
}

// Add session
async function addSession(title, desc) {
  const { error } = await supabaseClient.from('sessions').insert([
    { user_id: userId, title, desc }
  ]);
  if (error) return alert('Error adding session');
    updatePoints(userId, 1);
    fetchRecentSessions();
}

// Modal logic
function setupModal(triggerId, modalId) {
  const modal = document.getElementById(modalId);
  const trigger = document.getElementById(triggerId);
  const close = modal.querySelector('.close');
  trigger.onclick = () => { modal.style.display = 'block'; if (modalId === 'all-session-modal') fetchAllSessions(); };
  close.onclick = () => { modal.style.display = 'none'; };
  window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };
}

// Add session modal logic
addSessionBtn.onclick = () => {
  document.getElementById('add-session-modal').style.display = 'block';
};
document.getElementById('add-session-modal').querySelector('.close').onclick = () => {
  document.getElementById('add-session-modal').style.display = 'none';
};
document.getElementById('save-session').onclick = async () => {
  const title = document.getElementById('session-title').value;
  const desc = document.getElementById('session-desc').value;
  await addSession(title, desc);
  document.getElementById('add-session-modal').style.display = 'none';
};

// Show all sessions modal logic
showAllSessionsBtn.onclick = () => {
  document.getElementById('session-modal').style.display = 'block';
  fetchAllSessions();
};
document.getElementById('session-modal').querySelector('.close').onclick = () => {
  document.getElementById('session-modal').style.display = 'none';
};
window.onclick = (event) => {
  ['session-modal', 'add-session-modal'].forEach(id => {
    const modal = document.getElementById(id);
    if (event.target === modal) modal.style.display = 'none';
  });
};

// Initial load
fetchRecentSessions();


