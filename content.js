// content.js
// This script is specifically designed for the current Google Meet UI structure

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "pasteEmail") {
    const result = pasteEmailInChat(request.email);
    sendResponse({ success: result });
  } else if (request.action === "collectEmails") {
    const emails = collectEmailsFromChat();
    sendResponse({ emails });
  }
  return true; // keep the message channel open for async
});

// Keyboard shortcut: Ctrl+Shift+E (or Cmd+Shift+E on Mac)
document.addEventListener('keydown', function(event) {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
    chrome.storage.sync.get(['userEmail'], function(result) {
      if (result.userEmail) {
        pasteEmailInChat(result.userEmail);
      }
    });
  }
});

function pasteEmailInChat(email) {
  console.log("Attempting to paste email:", email);
  let chatInput = document.querySelector("textarea.qdOxv-fmcmS-wGMbrd")
               || document.querySelector('textarea[aria-label="Send a message to everyone"]')
               || document.querySelector('textarea[placeholder="Send a message to everyone"]');
  console.log("Chat input found:", !!chatInput);
  if (!chatInput) return false;

  chatInput.focus();
  chatInput.value = email;
  chatInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log("Set email in input field");

  setTimeout(() => {
    let sendButton = document.querySelector("button[jsname='SoqoBf']")
                  || document.querySelector('button[aria-label="Send message"]')
                  || document.querySelector('button[aria-label="Send a message to everyone"]');
    console.log("Send button found:", !!sendButton);
    if (sendButton && sendButton.hasAttribute('disabled')) {
      sendButton.removeAttribute('disabled');
    }
    if (sendButton) {
      sendButton.click();
      console.log("Send button clicked");
    } else {
      // fallback: simulate Enter
      chatInput.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
      }));
      console.log("Simulated Enter key");
    }
  }, 100);

  return true;
}

function collectEmailsFromChat() {
  console.log("Starting email collection process...");
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emails = new Set();

  // 1) look in spans
  document.querySelectorAll('div.ptNLrf span').forEach(span => {
    (span.textContent.match(emailRegex) || []).forEach(e => emails.add(e));
  });

  // 2) look in message containers
  if (!emails.size) {
    document.querySelectorAll('div[jscontroller="RrV5Ic"]').forEach(div => {
      (div.textContent.match(emailRegex) || []).forEach(e => emails.add(e));
    });
  }

  // 3) look in chat container
  if (!emails.size) {
    const c = document.querySelector('div[jsname="Oj3mjd"], div[jsname="xySENc"], div.hWX4r');
    if (c) (c.textContent.match(emailRegex) || []).forEach(e => emails.add(e));
  }

  // 4) page fallback
  if (!emails.size) {
    (document.body.textContent.match(emailRegex) || [])
      .filter(e => !/google\.com|example\.com/.test(e))
      .forEach(e => emails.add(e));
  }

  console.log(`Total unique emails found: ${emails.size}`);
  return Array.from(emails);
}