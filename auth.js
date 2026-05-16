
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function getCurrentUser() {
  return {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username')
  };
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

// Save session to database
async function saveSessionToDatabase(sessionData) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  console.log('Saving session to database:', sessionData);

  try {
    const response = await fetch(`${window.API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sessionData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Session saved to MongoDB:', data.session);
      showNotification('Session saved to database!', 'success');
    } else {
      console.error('❌ Failed to save session:', data);
      showNotification('Failed to save session', 'error');
    }
  } catch (error) {
    console.error('❌ Error saving session:', error);
    showNotification('Error saving session: ' + error.message, 'error');
  }
}

// Load user sessions from database
async function loadUserSessions() {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const response = await fetch(`${window.API_BASE_URL}/api/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data.success ? data.sessions : [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
}

// Initialize auth on page load
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  document.addEventListener('DOMContentLoaded', () => {
    // Block admin from accessing recording page
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      alert('Admins cannot access the recording page. Redirecting to admin dashboard...');
      window.location.href = 'admin.html';
      return;
    }
    
    if (checkAuth()) {
      const user = getCurrentUser();
      
      // Add logout button to header
      const headerStatus = document.querySelector('.header__status');
      if (headerStatus) {
        const userInfo = document.createElement('div');
        userInfo.style.cssText = 'display: flex; align-items: center; gap: 15px;';
        userInfo.innerHTML = `
          <a href="profile.html" style="color: #1FB8CD; font-weight: 600; text-decoration: none;">👤 ${user.username}</a>
          <button onclick="logout()" style="padding: 8px 16px; background: #B4413C; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">Logout</button>
        `;
        headerStatus.appendChild(userInfo);
      }
      
      // Override stopRecording to save to database
      window.stopRecording = stopRecordingWithDB;
    }
  });
}

// Override stopRecording to save to database
function stopRecordingWithDB() {
  console.log('🛑 Stop Recording WITH DB clicked');
  console.log('Recording state:', appState.isRecording);
  console.log('Session data length:', appState.sessionData.length);
  console.log('Attention history length:', appState.attentionHistory.length);
  
  appState.isRecording = false;
  
  // Update UI
  const recordBtn = document.getElementById('record-btn');
  const stopRecordBtn = document.getElementById('stop-record-btn');
  const recordingIndicator = document.getElementById('recording-indicator');
  
  if (recordBtn) recordBtn.classList.remove('hidden');
  if (stopRecordBtn) stopRecordBtn.classList.add('hidden');
  if (recordingIndicator) recordingIndicator.classList.add('hidden');
  
  // Stop recording timer
  if (appState.recordingTimer) {
    clearInterval(appState.recordingTimer);
    appState.recordingTimer = null;
  }
  
  const duration = Math.floor((Date.now() - appState.recordingStartTime) / 1000);
  
  // Save to database
  if (appState.sessionData.length > 0 && appState.attentionHistory.length > 0) {
    const avgAttention = appState.attentionHistory.reduce((sum, item) => sum + item.attention, 0) / appState.attentionHistory.length;
    const sessionData = {
      startTime: new Date(appState.recordingStartTime),
      endTime: new Date(),
      duration: duration,
      averageAttention: avgAttention,
      dataPoints: appState.sessionData.length,
      sessionData: appState.sessionData
    };
    
    console.log('📊 Preparing to save session:', sessionData);
    saveSessionToDatabase(sessionData);
  } else {
    console.warn('⚠️ No data to save - sessionData or attentionHistory is empty');
    showNotification('No data recorded', 'warning');
  }
  
  showNotification(`Recording stopped (${formatDuration(duration)})`, 'info');
}

// Auto-save sessions to database when recording stops
