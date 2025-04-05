// This script is specifically designed for the current Google Meet UI structure

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "pasteEmail") {
      const result = pasteEmailInChat(request.email);
      sendResponse({success: result});
    } else if (request.action === "collectEmails") {
      const emails = collectEmailsFromChat();
      sendResponse({emails: emails});
    }
    return true; // Required for async sendResponse
  });
  
  // Add keyboard shortcut support
  document.addEventListener('keydown', function(event) {
    // Ctrl+Shift+E (or Command+Shift+E on Mac)
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
    
    // Target the specific textarea based on the HTML structure from the inspect element
    let chatInput = document.querySelector("textarea.qdOxv-fmcmS-wGMbrd");
    
    // Fallback selectors if the specific one doesn't work
    if (!chatInput) {
      chatInput = document.querySelector('textarea[aria-label="Send a message to everyone"]');
    }
    
    if (!chatInput) {
      chatInput = document.querySelector('textarea[placeholder="Send a message to everyone"]');
    }
    
    console.log("Chat input found:", !!chatInput);
    
    if (chatInput) {
      // Focus on the chat input
      chatInput.focus();
      
      // Set the value and dispatch input event
      chatInput.value = email;
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("Set email in input field");
      
      // Look for the send button and click it
      setTimeout(() => {
        // Based on the HTML structure, target the specific send button
        let sendButton = document.querySelector("button[jsname='SoqoBf']");
        
        if (!sendButton) {
          sendButton = document.querySelector('button[aria-label="Send message"]');
        }
        
        if (!sendButton) {
          sendButton = document.querySelector('button[aria-label="Send a message to everyone"]');
        }
        
        console.log("Send button found:", !!sendButton);
        
        // Check if the button is disabled
        if (sendButton && sendButton.hasAttribute('disabled')) {
          console.log("Send button is disabled, removing disabled attribute");
          sendButton.removeAttribute('disabled');
        }
        
        if (sendButton) {
          sendButton.click();
          console.log("Send button clicked");
          return true;
        } else {
          // If no button found, try to simulate Enter key
          console.log("No send button found, simulating Enter key");
          chatInput.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
          }));
        }
      }, 100);
      
      return true;
    } else {
      console.log("Chat input not found");
      return false;
    }
  }
  
  function collectEmailsFromChat() {
    console.log("Starting email collection process...");
    
    // 1. First attempt: Look for specific span elements that might contain emails
    const textSpans = document.querySelectorAll('div.ptNLrf span');
    console.log(`Found ${textSpans.length} text spans`);
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = new Set();
    
    // Check each span for emails
    textSpans.forEach(span => {
      const text = span.textContent || span.innerText;
      if (text) {
        const matches = text.match(emailRegex);
        if (matches) {
          matches.forEach(email => {
            console.log(`Found email in span: ${email}`);
            emails.add(email);
          });
        }
      }
    });
    
    // 2. Second attempt: Look for all divs with jscontroller="RrV5Ic" which appear to contain messages
    if (emails.size === 0) {
      console.log("Trying message containers with jscontroller='RrV5Ic'");
      const messageDivs = document.querySelectorAll('div[jscontroller="RrV5Ic"]');
      console.log(`Found ${messageDivs.length} message divs`);
      
      messageDivs.forEach(div => {
        const text = div.textContent || div.innerText;
        if (text) {
          const matches = text.match(emailRegex);
          if (matches) {
            matches.forEach(email => {
              console.log(`Found email in message div: ${email}`);
              emails.add(email);
            });
          }
        }
      });
    }
    
    // 3. Third attempt: Look in the chat container directly
    if (emails.size === 0) {
      console.log("Trying direct chat container search");
      const chatContainer = document.querySelector('div[jsname="Oj3mjd"]') || 
                            document.querySelector('div[jsname="xySENc"]') ||
                            document.querySelector('div.hWX4r');
      
      if (chatContainer) {
        console.log("Found chat container");
        const text = chatContainer.textContent || chatContainer.innerText;
        if (text) {
          const matches = text.match(emailRegex);
          if (matches) {
            matches.forEach(email => {
              console.log(`Found email in chat container: ${email}`);
              emails.add(email);
            });
          }
        }
      }
    }
    
    // 4. Fourth attempt: Get the entire page text as a last resort
    if (emails.size === 0) {
      console.log("Trying entire page text");
      const allText = document.body.textContent || document.body.innerText;
      const matches = allText.match(emailRegex);
      if (matches) {
        matches.forEach(email => {
          // Filter out common Google Meet UI emails
          if (!email.includes('google.com') && !email.includes('example.com')) {
            console.log(`Found email in page text: ${email}`);
            emails.add(email);
          }
        });
      }
    }
    
    // 5. Extra attempt: Try a different approach to find messages
    if (emails.size === 0) {
      console.log("Trying class-based message selector");
      const messageElements = document.querySelectorAll('.jO4O1, .beTDc, .MuzmKe');
      console.log(`Found ${messageElements.length} message elements by class`);
      
      messageElements.forEach(element => {
        const text = element.textContent || element.innerText;
        if (text) {
          const matches = text.match(emailRegex);
          if (matches) {
            matches.forEach(email => {
              console.log(`Found email in message element: ${email}`);
              emails.add(email);
            });
          }
        }
      });
    }
    
    // 6. Specific to the structure in the HTML snippet you provided
    if (emails.size === 0) {
      console.log("Trying structure from provided HTML snippet");
      const divWithEmails = document.querySelectorAll('div[jsname="dTKtvb"] span');
      console.log(`Found ${divWithEmails.length} divs with potential emails`);
      
      divWithEmails.forEach(div => {
        const text = div.textContent || div.innerText;
        if (text) {
          console.log(`Checking text: ${text}`);
          const matches = text.match(emailRegex);
          if (matches) {
            matches.forEach(email => {
              console.log(`Found email in specific div: ${email}`);
              emails.add(email);
            });
          }
        }
      });
    }
    
    console.log(`Total unique emails found: ${emails.size}`);
    return Array.from(emails);
  }