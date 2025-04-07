// popup.js
document.addEventListener('DOMContentLoaded', () => {
  // Debug log area
  const debugLog = document.createElement('div');
  debugLog.id = 'debugLog';
  debugLog.style.cssText = 'margin-top:15px;padding:10px;background:#f5f5f5;border:1px solid #ddd;max-height:150px;overflow-y:auto;font-family:monospace;font-size:12px;display:none;';
  document.querySelector('.container').appendChild(debugLog);

  const debugToggle = document.createElement('button');
  debugToggle.textContent = 'Show Debug Info';
  debugToggle.style.cssText = 'margin-top:15px;background:#f1f1f1;color:#333;';
  debugToggle.addEventListener('click', () => {
    debugLog.style.display = debugLog.style.display === 'none' ? 'block' : 'none';
    debugToggle.textContent = debugLog.style.display === 'none' ? 'Show Debug Info' : 'Hide Debug Info';
  });
  document.querySelector('.container').appendChild(debugToggle);

  function logDebug(msg) {
    const entry = document.createElement('div');
    entry.textContent = `${new Date().toLocaleTimeString()}: ${msg}`;
    debugLog.appendChild(entry);
    debugLog.scrollTop = debugLog.scrollHeight;
  }

  // Load or detect saved email
  chrome.storage.sync.get(['userEmail'], ({ userEmail }) => {
    if (userEmail) {
      document.getElementById('userEmail').value = userEmail;
      logDebug(`Loaded saved email: ${userEmail}`);
    }
  });

  // Save email
  document.getElementById('saveEmail').addEventListener('click', () => {
    const email = document.getElementById('userEmail').value.trim();
    if (!email) return;
    chrome.storage.sync.set({ userEmail: email }, () => {
      document.getElementById('status').style.display = 'block';
      setTimeout(() => document.getElementById('status').style.display = 'none', 2000);
      logDebug(`Email saved: ${email}`);
    });
  });

  // Paste email into Meet chat
  document.getElementById('pasteEmail').addEventListener('click', () => {
    logDebug('Paste email clicked');
    chrome.storage.sync.get(['userEmail'], ({ userEmail }) => {
      if (!userEmail) return alert('Please save your email first!');
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        logDebug(`Sending pasteEmail message to tab ${tabs[0].id}`);
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'pasteEmail', email: userEmail },
          response => {
            if (chrome.runtime.lastError) {
              logDebug(`Error: ${chrome.runtime.lastError.message}`);
            } else {
              logDebug(`Paste result: ${response.success}`);
            }
          }
        );
      });
    });
  });

  // Collect emails from Meet chat
  document.getElementById('collectEmails').addEventListener('click', () => {
    logDebug('Collect emails clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      logDebug(`Sending collectEmails message to tab ${tabs[0].id}`);
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'collectEmails' },
        response => {
          if (chrome.runtime.lastError) {
            logDebug(`Error: ${chrome.runtime.lastError.message}`);
            alert(`Error: ${chrome.runtime.lastError.message}`);
          } else {
            logDebug(`Found ${response.emails.length} emails`);
            displayEmails(response.emails);
          }
        }
      );
    });
  });

  // Copy all collected emails
  document.getElementById('copyEmails').addEventListener('click', () => {
    const ta = document.getElementById('emailTextArea');
    ta.select();
    document.execCommand('copy');
    alert('Emails copied to clipboard!');
    logDebug(`Copied emails: ${ta.value}`);
  });
});

// Render collected emails in the popup
function displayEmails(emails) {
  const listDiv = document.getElementById('emailList');
  const ta = document.getElementById('emailTextArea');
  if (!emails.length) {
    listDiv.innerHTML = '<p>No emails found in the chat.</p>';
    ta.value = '';
  } else {
    listDiv.innerHTML = '<h3>Found Emails:</h3><ul>' +
      emails.map(e => `<li>${e}</li>`).join('') +
      '</ul>';
    ta.value = emails.join('\n');
  }
  listDiv.style.display = 'block';
}