// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const debugToggle = document.getElementById('debugToggle');
  const debugLog = document.getElementById('debugLog');
  // Toggle debug console
  debugToggle.addEventListener('click', () => {
    const isVisible = debugLog.style.display === 'block';
    debugLog.style.display = isVisible ? 'none' : 'block';
    debugToggle.textContent = isVisible ? 'Show Debug Console' : 'Hide Debug Console';
  });

  function logDebug(msg) {
    const line = document.createElement('div');
    line.textContent = `${new Date().toLocaleTimeString()}: ${msg}`;
    debugLog.appendChild(line);
    debugLog.scrollTop = debugLog.scrollHeight;
  }

  // (1) Reload saved emails when the popup opens
  chrome.storage.local.get('collectedEmails', ({ collectedEmails }) => {
    if (collectedEmails && collectedEmails.length) {
      displayEmails(collectedEmails);
      logDebug(`Reloaded ${collectedEmails.length} saved emails`);
    }
  });

  // Load saved user email
  chrome.storage.sync.get(['userEmail'], ({ userEmail }) => {
    if (userEmail) {
      document.getElementById('userEmail').value = userEmail;
      logDebug(`Loaded saved userEmail: ${userEmail}`);
    }
  });

  // Save email
  document.getElementById('saveEmail').addEventListener('click', () => {
    const email = document.getElementById('userEmail').value.trim();
    if (!email) return;
    chrome.storage.sync.set({ userEmail: email }, () => {
      document.getElementById('status').style.display = 'block';
      setTimeout(() => document.getElementById('status').style.display = 'none', 2000);
      logDebug(`Saved userEmail: ${email}`);
    });
  });

  // Paste email into Meet chat
  document.getElementById('pasteEmail').addEventListener('click', () => {
    chrome.storage.sync.get(['userEmail'], ({ userEmail }) => {
      if (!userEmail) {
        alert('Please save your email first!');
        return logDebug('Paste failed: no userEmail saved');
      }
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        logDebug('Sending pasteEmail message');
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'pasteEmail', email: userEmail },
          response => {
            if (chrome.runtime.lastError) {
              alert(`Error: ${chrome.runtime.lastError.message}`);
              logDebug(`pasteEmail error: ${chrome.runtime.lastError.message}`);
            } else {
              logDebug(`pasteEmail success: ${response.success}`);
            }
          }
        );
      });
    });
  });

  // Collect emails from Meet chat
  document.getElementById('collectEmails').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      logDebug('Sending collectEmails message');
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'collectEmails' },
        response => {
          if (chrome.runtime.lastError) {
            alert(`Error: ${chrome.runtime.lastError.message}`);
            logDebug(`collectEmails error: ${chrome.runtime.lastError.message}`);
          } else {
            displayEmails(response.emails);
            chrome.storage.local.set({ collectedEmails: response.emails });
            logDebug(`Collected and saved ${response.emails.length} emails`);
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
    logDebug(`Copied ${ta.value.split('\n').length} emails to clipboard`);
  });

  // Clear stored & displayed emails
  document.getElementById('clearEmails').addEventListener('click', () => {
    chrome.storage.local.remove('collectedEmails', () => {
      document.getElementById('emailList').style.display = 'none';
      document.getElementById('emailTextArea').value = '';
      alert('Collected emails cleared.');
      logDebug('Cleared collectedEmails from storage');
    });
  });
});

// Renders the list of emails in the popup
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