// Load saved settings
chrome.storage.sync.get(['defaultAnswer', 'autoSubmit', 'fillComments'], function(data) {
  if (data.defaultAnswer !== undefined) {
    document.getElementById('defaultAnswer').value = data.defaultAnswer;
  }
  if (data.autoSubmit !== undefined) {
    document.getElementById('autoSubmit').checked = data.autoSubmit;
  }
  if (data.fillComments !== undefined) {
    document.getElementById('fillComments').checked = data.fillComments;
  }
});

// Save settings when changed
document.getElementById('defaultAnswer').addEventListener('change', function() {
  chrome.storage.sync.set({ defaultAnswer: this.value });
});

document.getElementById('autoSubmit').addEventListener('change', function() {
  chrome.storage.sync.set({ autoSubmit: this.checked });
});

document.getElementById('fillComments').addEventListener('change', function() {
  chrome.storage.sync.set({ fillComments: this.checked });
});

// Fill Survey button
document.getElementById('fillBtn').addEventListener('click', async function() {
  const answerIndex = parseInt(document.getElementById('defaultAnswer').value);
  const autoSubmit = document.getElementById('autoSubmit').checked;
  const fillComments = document.getElementById('fillComments').checked;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { 
    action: 'fillSurvey', 
    answerIndex: answerIndex,
    autoSubmit: autoSubmit,
    fillComments: fillComments
  }, function(response) {
    if (chrome.runtime.lastError) {
      showStatus('❌ Error: Not on survey page', 'error');
    } else if (response && response.success) {
      showStatus('✅ Survey filled successfully!', 'success');
    } else {
      showStatus('❌ Failed to fill survey', 'error');
    }
  });
});

// Submit button
document.getElementById('submitBtn').addEventListener('click', async function() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'submitSurvey' }, function(response) {
    if (chrome.runtime.lastError) {
      showStatus('❌ Error: Not on survey page', 'error');
    } else if (response && response.success) {
      showStatus('✅ Survey submitted!', 'success');
    } else {
      showStatus('❌ Failed to submit', 'error');
    }
  });
});

// Auto Fill All Surveys button
document.getElementById('autoAllBtn').addEventListener('click', async function() {
  const answerIndex = parseInt(document.getElementById('defaultAnswer').value);
  const fillComments = document.getElementById('fillComments').checked;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  showStatus('🔄 Processing all surveys...', 'info');
  
  chrome.tabs.sendMessage(tab.id, { 
    action: 'autoFillAll',
    answerIndex: answerIndex,
    fillComments: fillComments
  }, function(response) {
    if (chrome.runtime.lastError) {
      showStatus('❌ Error: Not on survey list page', 'error');
    } else if (response && response.success) {
      showStatus(`✅ Processing ${response.count} surveys...`, 'success');
    } else {
      showStatus('❌ Failed to start auto-fill', 'error');
    }
  });
});

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = 'status ' + (type || '');

  setTimeout(() => {
    statusEl.textContent = 'Ready — open a survey page to begin';
    statusEl.className = 'status';
  }, 3000);
}
