// Popup script for JobPrep LinkedIn CV Importer

let extractedData = null;
let messageTimeoutId = null;

// DOM Elements
const currentUrlElement = document.getElementById('currentUrl');
const extractBtn = document.getElementById('extractBtn');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const targetUrlInput = document.getElementById('targetUrl');
const messageContainer = document.getElementById('messageContainer');
const previewElement = document.getElementById('preview');

// Initialize app
function initializeApp() {
  // Load saved target URL
  chrome.storage.local.get(['targetUrl'], (result) => {
    if (result.targetUrl) {
      targetUrlInput.value = result.targetUrl;
    }
  });

  // Get current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentUrlElement.textContent = tabs[0].url;
      currentUrlElement.title = tabs[0].url;
      
      // Check if on LinkedIn profile page
      if (!tabs[0].url.includes('linkedin.com/in/')) {
        showMessage('Please navigate to a LinkedIn profile page to extract data', 'warning');
        extractBtn.disabled = true;
      }
    }
  });

  // Load previously extracted data if available
  chrome.storage.local.get(['extractedData'], (result) => {
    if (result.extractedData) {
      extractedData = result.extractedData;
      showPreview(extractedData);
      sendBtn.disabled = false;
      clearBtn.classList.remove('hidden');
      showMessage('Using previously extracted data', 'info');
    }
  });
}

// Show message with auto-hide
function showMessage(text, type = 'info', duration = 8000) {
  // Clear previous message timeout
  if (messageTimeoutId) {
    clearTimeout(messageTimeoutId);
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  // Add icon based on type
  const iconMap = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  messageDiv.innerHTML = `<span>${iconMap[type] || '•'}</span><span>${escapeHtml(text)}</span>`;
  messageContainer.innerHTML = '';
  messageContainer.appendChild(messageDiv);
  
  // Auto-hide after duration
  messageTimeoutId = setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove();
    }
  }, duration);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show preview
function showPreview(data) {
  if (!data) {
    previewElement.classList.add('hidden');
    return;
  }

  let previewHTML = '<div class="preview-title">📋 Extracted Data</div>';
  
  if (data.personalInfo?.fullName) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Name:</span>
      <span class="preview-value">${escapeHtml(data.personalInfo.fullName)}</span>
    </div>`;
  }
  
  if (data.personalInfo?.title) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Title:</span>
      <span class="preview-value">${escapeHtml(data.personalInfo.title)}</span>
    </div>`;
  }
  
  if (data.personalInfo?.location) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Location:</span>
      <span class="preview-value">${escapeHtml(data.personalInfo.location)}</span>
    </div>`;
  }
  
  if (data.experience?.length > 0) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Experience:</span>
      <span class="preview-value">${data.experience.length} ${data.experience.length === 1 ? 'position' : 'positions'}</span>
    </div>`;
  }
  
  if (data.education?.length > 0) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Education:</span>
      <span class="preview-value">${data.education.length} ${data.education.length === 1 ? 'entry' : 'entries'}</span>
    </div>`;
  }
  
  if (data.skills?.length > 0) {
    const totalSkills = data.skills.reduce((sum, group) => sum + (group.items?.length || 0), 0);
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Skills:</span>
      <span class="preview-value">${totalSkills} skills</span>
    </div>`;
  }
  
  if (data.certifications?.length > 0) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Certifications:</span>
      <span class="preview-value">${data.certifications.length}</span>
    </div>`;
  }

  previewElement.innerHTML = previewHTML;
  previewElement.classList.remove('hidden');
}

// Validate URL format
function validateUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Helper function to inject content script if not already loaded
async function ensureContentScriptLoaded(tabId) {
  try {
    // Try to ping the content script
    const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return response.success;
  } catch (error) {
    // Content script not loaded, inject it manually
    console.log('Content script not found, injecting...');
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      console.log('Content script injected successfully');
      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
      return false;
    }
  }
}

// Save target URL on change
targetUrlInput.addEventListener('change', () => {
  const url = targetUrlInput.value.trim();
  if (url && !validateUrl(url)) {
    showMessage('Invalid URL format. Use http:// or https://', 'error');
    return;
  }
  chrome.storage.local.set({ targetUrl: url });
});

// Extract profile data
extractBtn.addEventListener('click', async () => {
  extractBtn.disabled = true;
  const originalText = extractBtn.innerHTML;
  extractBtn.innerHTML = '<span class="loader"></span><span>Extracting...</span>';
  messageContainer.innerHTML = '';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url?.includes('linkedin.com/in/')) {
      showMessage('Not a LinkedIn profile page. Please navigate to a profile.', 'error');
      extractBtn.disabled = false;
      extractBtn.innerHTML = originalText;
      return;
    }

    // Ensure content script is loaded
    const scriptLoaded = await ensureContentScriptLoaded(tab.id);
    if (!scriptLoaded) {
      showMessage('Failed to load on this page. Please refresh and try again.', 'error');
      extractBtn.disabled = false;
      extractBtn.innerHTML = originalText;
      return;
    }

    // Send message to content script with timeout
    const extractionPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Extraction timed out. The page may be loading or content not found.'));
      }, 30000); // 30 second timeout

      chrome.tabs.sendMessage(tab.id, { action: 'extractProfile' }, (response) => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response?.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'Failed to extract profile data'));
        }
      });
    });

    const profileData = await extractionPromise;
    extractedData = profileData;
    
    // Save to storage
    chrome.storage.local.set({ extractedData: extractedData });
    
    showMessage('✅ Profile data extracted successfully!', 'success', 5000);
    showPreview(extractedData);
    sendBtn.disabled = false;
    clearBtn.classList.remove('hidden');
    
  } catch (error) {
    console.error('Extraction error:', error);
    showMessage(`Error: ${error.message}`, 'error');
  } finally {
    extractBtn.disabled = false;
    extractBtn.innerHTML = originalText;
  }
});

// Send to JobPrep
sendBtn.addEventListener('click', async () => {
  if (!extractedData) {
    showMessage('No data extracted yet', 'error');
    return;
  }

  const targetUrl = targetUrlInput.value.trim();
  if (!targetUrl) {
    showMessage('Please enter a JobPrep URL', 'error');
    return;
  }

  if (!validateUrl(targetUrl)) {
    showMessage('Invalid URL format. Use http:// or https://', 'error');
    return;
  }

  sendBtn.disabled = true;
  const originalText = sendBtn.innerHTML;
  sendBtn.innerHTML = '<span class="loader"></span><span>Sending...</span>';
  messageContainer.innerHTML = '';

  try {
    const sendPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timed out. Is JobPrep running and accessible at ' + targetUrl + '?'));
      }, 15000); // 15 second timeout

      fetch(`${targetUrl}/api/cv/import-extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedData),
      }).then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      }).then(data => {
        if (!data.success) {
          throw new Error(data.error || 'Server returned an error');
        }
        resolve(data);
      }).catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });

    const result = await sendPromise;

    if (result.success) {
      showMessage('✅ Data sent successfully! Opening CV Builder...', 'success', 4000);
      
      // Open CV builder with data ID in URL
      setTimeout(() => {
        const dataId = result.dataId;
        const cvBuilderUrl = dataId 
          ? `${targetUrl}/cv-builder?import=${dataId}`
          : `${targetUrl}/cv-builder`;
        console.log('Opening tab with URL:', cvBuilderUrl);
        chrome.tabs.create({ url: cvBuilderUrl }, (tab) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to create tab:', chrome.runtime.lastError);
            showMessage(`Failed to open CV Builder: ${chrome.runtime.lastError.message}`, 'error');
          } else {
            console.log('Tab created successfully:', tab.id, tab.url);
          }
        });
      }, 1500);
    } else {
      showMessage(`Error: ${result.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    console.error('Send error:', error);
    let errorMsg = 'Unknown error occurred';
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        errorMsg = `Failed to connect to ${targetUrl}. Check the URL and ensure the server is running.`;
      } else if (error.message.includes('timed out')) {
        errorMsg = error.message;
      } else if (error.message.includes('HTTP 404')) {
        errorMsg = `API endpoint not found at ${targetUrl}/api/cv/import-extension`;
      } else if (error.message.includes('HTTP 500')) {
        errorMsg = 'Server error. Please try again.';
      } else {
        errorMsg = error.message;
      }
    }
    showMessage(`Error: ${errorMsg}`, 'error');
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = originalText;
  }
});

// Clear data
clearBtn.addEventListener('click', () => {
  if (confirm('Clear extracted data? This cannot be undone.')) {
    extractedData = null;
    chrome.storage.local.remove(['extractedData']);
    previewElement.classList.add('hidden');
    sendBtn.disabled = true;
    clearBtn.classList.add('hidden');
    showMessage('Data cleared', 'info', 3000);
  }
});

// Initialize when popup opens
initializeApp();

