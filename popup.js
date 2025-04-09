// popup.js
document.addEventListener('DOMContentLoaded', () => {
  // (1) Reload saved emails when the popup opens
  chrome.storage.local.get('collectedEmails', ({ collectedEmails }) => {
    if (collectedEmails && collectedEmails.length) {
      displayEmails(collectedEmails);
    }
  });

  // Load or detect saved user email
  chrome.storage.sync.get(['userEmail'], ({ userEmail }) => {
    if (userEmail) {
      document.getElementById('userEmail').value = userEmail;
    }
  });

  // Save email
  document.getElementById('saveEmail').addEventListener('click', () => {
    const email = document.getElementById('userEmail').value.trim();
    if (!email) return;
    chrome.storage.sync.set({ userEmail: email }, () => {
      const status = document.getElementById('status');
      status.style.display = 'block';
      setTimeout(() => status.style.display = 'none', 2000);
    });
  });

  // Paste email into Meet chat
  document.getElementById('pasteEmail').addEventListener('click', () => {
    chrome.storage.sync.get(['userEmail'], ({ userEmail }) => {
      if (!userEmail) return alert('Please save your email first!');
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'pasteEmail', email: userEmail },
          response => {
            if (chrome.runtime.lastError) {
              alert(`Error: ${chrome.runtime.lastError.message}`);
            }
          }
        );
      });
    });
  });

  // Collect emails from Meet chat
  document.getElementById('collectEmails').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'collectEmails' },
        response => {
          if (chrome.runtime.lastError) {
            alert(`Error: ${chrome.runtime.lastError.message}`);
          } else {
            displayEmails(response.emails);
            // (2) Persist collected emails
            chrome.storage.local.set({ collectedEmails: response.emails });
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
  });

  // Clear stored & displayed emails
  document.getElementById('clearEmails').addEventListener('click', () => {
    chrome.storage.local.remove('collectedEmails', () => {
      document.getElementById('emailList').style.display = 'none';
      document.getElementById('emailTextArea').value = '';
      alert('Collected emails cleared.');
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