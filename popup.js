document.addEventListener('DOMContentLoaded', function() {
    // Create a debug log area
    const debugLog = document.createElement('div');
    debugLog.id = 'debugLog';
    debugLog.style.cssText = 'margin-top: 15px; padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 12px; display: none;';
    document.querySelector('.container').appendChild(debugLog);
    
    // Add debug toggle
    const debugToggle = document.createElement('button');
    debugToggle.textContent = 'Show Debug Info';
    debugToggle.style.cssText = 'margin-top: 15px; background-color: #f1f1f1; color: #333;';
    debugToggle.addEventListener('click', function() {
      const debugLog = document.getElementById('debugLog');
      if (debugLog.style.display === 'none') {
        debugLog.style.display = 'block';
        this.textContent = 'Hide Debug Info';
      } else {
        debugLog.style.display = 'none';
        this.textContent = 'Show Debug Info';
      }
    });
    document.querySelector('.container').appendChild(debugToggle);
    
    // Helper function to log to debug area
    function logDebug(message) {
      const debugLog = document.getElementById('debugLog');
      const logEntry = document.createElement('div');
      logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
      debugLog.appendChild(logEntry);
      debugLog.scrollTop = debugLog.scrollHeight;
    }
  
    // Try to detect user's email from Google Meet page
    function detectUserEmail() {
      logDebug('Attempting to detect user email...');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0].url.includes('meet.google.com')) {
          chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: getUserEmailFromPage
          }, (results) => {
            if (chrome.runtime.lastError) {
              logDebug(`Error detecting email: ${chrome.runtime.lastError.message}`);
            } else if (results && results[0] && results[0].result) {
              const email = results[0].result;
              logDebug(`Detected email: ${email}`);
              document.getElementById('userEmail').value = email;
              
              // Save the detected email
              chrome.storage.sync.set({userEmail: email}, function() {
                logDebug('Detected email saved automatically');
              });
            } else {
              logDebug('No email detected from page');
              // If we can't detect email, load from storage
              loadSavedEmail();
            }
          });
        } else {
          logDebug('Not on Google Meet, loading saved email');
          loadSavedEmail();
        }
      });
    }
    
    // Fallback to load saved email
    function loadSavedEmail() {
      chrome.storage.sync.get(['userEmail'], function(result) {
        if (result.userEmail) {
          document.getElementById('userEmail').value = result.userEmail;
          logDebug(`Loaded saved email: ${result.userEmail}`);
        }
      });
    }
    
    // Try to detect email on popup open
    detectUserEmail();
  
    // Save email button
    document.getElementById('saveEmail').addEventListener('click', function() {
      let email = document.getElementById('userEmail').value.trim();
      if (email) {
        chrome.storage.sync.set({userEmail: email}, function() {
          let status = document.getElementById('status');
          status.style.display = 'block';
          setTimeout(function() {
            status.style.display = 'none';
          }, 2000);
          logDebug(`Email saved: ${email}`);
        });
      }
    });
  
    // Paste email button
    document.getElementById('pasteEmail').addEventListener('click', function() {
      logDebug('Attempting to paste email...');
      chrome.storage.sync.get(['userEmail'], function(result) {
        if (result.userEmail) {
          logDebug(`Using email: ${result.userEmail}`);
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            logDebug(`Executing in tab: ${tabs[0].id}`);
            chrome.scripting.executeScript({
              target: {tabId: tabs[0].id},
              function: pasteEmailInChat,
              args: [result.userEmail]
            }, (results) => {
              if (chrome.runtime.lastError) {
                logDebug(`Error: ${chrome.runtime.lastError.message}`);
              } else if (results && results[0]) {
                logDebug(`Result: ${JSON.stringify(results[0].result)}`);
              }
            });
          });
        } else {
          logDebug('No email saved. Please save your email first.');
          alert('Please save your email first!');
        }
      });
    });
  
    // Collect emails button
    document.getElementById('collectEmails').addEventListener('click', function() {
      logDebug('Attempting to collect emails...');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        logDebug(`Executing in tab: ${tabs[0].id}`);
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: collectEmailsFromChat
        }, (results) => {
          if (chrome.runtime.lastError) {
            logDebug(`Error: ${chrome.runtime.lastError.message}`);
            alert(`Error: ${chrome.runtime.lastError.message}`);
          } else if (results && results[0]) {
            const emails = results[0].result;
            logDebug(`Found ${emails.length} emails: ${JSON.stringify(emails)}`);
            displayEmails(emails);
          } else {
            logDebug('No results returned');
          }
        });
      });
    });
  
    // Copy emails button
    document.getElementById('copyEmails').addEventListener('click', function() {
      const emailTextArea = document.getElementById('emailTextArea');
      logDebug(`Copying emails: ${emailTextArea.value}`);
      emailTextArea.select();
      document.execCommand('copy');
      alert('Emails copied to clipboard!');
    });
  });
  
  // Function to display collected emails
  function displayEmails(emails) {
    const emailList = document.getElementById('emailList');
    const emailTextArea = document.getElementById('emailTextArea');
    
    if (emails.length === 0) {
      emailList.innerHTML = '<p>No emails found in the chat.</p>';
      emailTextArea.value = '';
    } else {
      emailList.innerHTML = '<h3>Found Emails:</h3><ul>' + 
        emails.map(email => `<li>${email}</li>`).join('') + 
        '</ul>';
      emailTextArea.value = emails.join('\n');
    }
    
    emailList.style.display = 'block';
  }
  
  // Function to get user email from the Google Meet page
  function getUserEmailFromPage() {
    console.log("Attempting to detect user email from page");
    
    // Method 1: Look for profile elements in the UI
    // These are common selectors where Google displays user information
    const profileElements = [
      document.querySelector('[aria-label*="profile" i]'),
      document.querySelector('[data-email]'),
      document.querySelector('[data-identifier]'),
      document.querySelector('[aria-label*="account" i]')
    ];
    
    for (const element of profileElements) {
      if (element) {
        // Check for data attributes that might contain email
        if (element.dataset && element.dataset.email) {
          console.log("Found email in data-email attribute:", element.dataset.email);
          return element.dataset.email;
        }
        
        if (element.dataset && element.dataset.identifier) {
          const identifier = element.dataset.identifier;
          if (identifier && identifier.includes('@')) {
            console.log("Found email in data-identifier attribute:", identifier);
            return identifier;
          }
        }
        
        // Check aria-label which might contain email
        if (element.getAttribute('aria-label')) {
          const label = element.getAttribute('aria-label');
          const emailMatch = label.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
          if (emailMatch) {
            console.log("Found email in aria-label:", emailMatch[0]);
            return emailMatch[0];
          }
        }
      }
    }
    
    // Method 2: Check for "You" label in the chat
    // In Google Meet, when you send a message, it shows "You" next to your message
    const yourMessages = document.querySelectorAll('.poVWob');
    for (const element of yourMessages) {
      if (element.textContent === 'You') {
        // Found a message sent by the user, look for its text
        const messageContainer = element.closest('.Ss4fHf');
        if (messageContainer) {
          const messageTextElement = messageContainer.querySelector('.ptNLrf span');
          if (messageTextElement) {
            const text = messageTextElement.textContent;
            const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
            if (emailMatch) {
              console.log("Found user's email in their own message:", emailMatch[0]);
              return emailMatch[0];
            }
          }
        }
      }
    }
    
    // Method 3: Check for the email in the page metadata
    const metaTags = document.querySelectorAll('meta');
    for (const meta of metaTags) {
      if (meta.content && meta.content.includes('@')) {
        const emailMatch = meta.content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
          console.log("Found email in meta tag:", emailMatch[0]);
          return emailMatch[0];
        }
      }
    }
    
    // Method 4: Look at "You" in the participant list
    const participants = document.querySelectorAll('[role="listitem"]');
    for (const participant of participants) {
      if (participant.textContent.includes('(You)') || participant.textContent.includes('You')) {
        const emailMatch = participant.textContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
          console.log("Found email in participant list:", emailMatch[0]);
          return emailMatch[0];
        }
      }
    }
    
    // Method 5: Based on your HTML snippet, look for messages from "You"
    const youDivs = document.querySelectorAll('.HNucUd');
    for (const div of youDivs) {
      if (div.textContent.includes('You')) {
        // Try to find an adjacent message with an email
        const messageContainer = div.closest('.Ss4fHf');
        if (messageContainer) {
          const nextMessages = messageContainer.querySelectorAll('.jO4O1, .ptNLrf span');
          for (const message of nextMessages) {
            const text = message.textContent;
            const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
            if (emailMatch) {
              console.log("Found user's email in their own message:", emailMatch[0]);
              return emailMatch[0];
            }
          }
        }
      }
    }
    
    console.log("Could not detect user email from the page");
    return null;
  }
  
  // These functions are placeholders that will be replaced by the actual implementations from content.js
  function pasteEmailInChat(email) {
    console.log("This function will be replaced by the implementation in content.js");
  }
  
  function collectEmailsFromChat() {
    console.log("This function will be replaced by the implementation in content.js");
  }