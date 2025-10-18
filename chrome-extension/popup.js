// Popup script for JobPrep LinkedIn CV Importer

let extractedData = null;

// DOM Elements
const currentUrlElement = document.getElementById('currentUrl');
const extractBtn = document.getElementById('extractBtn');
const sendBtn = document.getElementById('sendBtn');
const targetUrlInput = document.getElementById('targetUrl');
const messageContainer = document.getElementById('messageContainer');
const previewElement = document.getElementById('preview');

// Load saved target URL
chrome.storage.local.get(['targetUrl'], (result) => {
  if (result.targetUrl) {
    targetUrlInput.value = result.targetUrl;
  }
});

// Save target URL on change
targetUrlInput.addEventListener('change', () => {
  chrome.storage.local.set({ targetUrl: targetUrlInput.value });
});

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    currentUrlElement.textContent = tabs[0].url;
    
    // Check if on LinkedIn profile page
    if (!tabs[0].url.includes('linkedin.com/in/')) {
      showMessage('Please navigate to a LinkedIn profile page', 'info');
      extractBtn.disabled = true;
    }
  }
});

// Show message
function showMessage(text, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  messageContainer.innerHTML = '';
  messageContainer.appendChild(messageDiv);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Show preview
function showPreview(data) {
  if (!data) {
    previewElement.classList.add('hidden');
    return;
  }

  let previewHTML = '<div style="font-weight: 600; margin-bottom: 8px;">📋 Extracted Data:</div>';
  
  if (data.personalInfo.fullName) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Name:</span>${data.personalInfo.fullName}
    </div>`;
  }
  
  if (data.personalInfo.title) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Title:</span>${data.personalInfo.title}
    </div>`;
  }
  
  if (data.experience.length > 0) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Experience:</span>${data.experience.length} positions
    </div>`;
  }
  
  if (data.education.length > 0) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Education:</span>${data.education.length} entries
    </div>`;
  }
  
  if (data.skills.length > 0) {
    const totalSkills = data.skills.reduce((sum, group) => sum + group.items.length, 0);
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Skills:</span>${totalSkills} skills
    </div>`;
  }
  
  if (data.certifications.length > 0) {
    previewHTML += `<div class="preview-item">
      <span class="preview-label">Certifications:</span>${data.certifications.length} certs
    </div>`;
  }

  previewElement.innerHTML = previewHTML;
  previewElement.classList.remove('hidden');
}

// Helper function to inject content script if not already loaded
async function ensureContentScriptLoaded(tabId) {
  try {
    // Try to ping the content script
    const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return true; // Content script is loaded
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

// Extract profile data
extractBtn.addEventListener('click', async () => {
  extractBtn.disabled = true;
  extractBtn.textContent = '⏳ Extracting...';
  messageContainer.innerHTML = '';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('linkedin.com/in/')) {
      showMessage('Not a LinkedIn profile page', 'error');
      extractBtn.disabled = false;
      extractBtn.textContent = '📥 Extract Profile Data';
      return;
    }

    // Ensure content script is loaded
    const scriptLoaded = await ensureContentScriptLoaded(tab.id);
    if (!scriptLoaded) {
      showMessage('Failed to load content script. Please refresh the page.', 'error');
      extractBtn.disabled = false;
      extractBtn.textContent = '📥 Extract Profile Data';
      return;
    }

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'extractProfile' }, (response) => {
      if (chrome.runtime.lastError) {
        showMessage('Error: ' + chrome.runtime.lastError.message, 'error');
        extractBtn.disabled = false;
        extractBtn.textContent = '📥 Extract Profile Data';
        return;
      }

      if (response && response.success && response.data) {
        extractedData = response.data;
        
        // Save to storage
        chrome.storage.local.set({ extractedData: extractedData });
        
        showMessage('✅ Profile data extracted successfully!', 'success');
        showPreview(extractedData);
        sendBtn.disabled = false;
      } else {
        showMessage('Failed to extract profile data', 'error');
      }
      
      extractBtn.disabled = false;
      extractBtn.textContent = '📥 Extract Profile Data';
    });
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error: ' + error.message, 'error');
    extractBtn.disabled = false;
    extractBtn.textContent = '📥 Extract Profile Data';
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

  sendBtn.disabled = true;
  sendBtn.textContent = '⏳ Sending...';
  messageContainer.innerHTML = '';

  try {
    const response = await fetch(`${targetUrl}/api/cv/import-extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(extractedData),
    });

    if (response.ok) {
      const result = await response.json();
      showMessage('✅ Data sent successfully! Opening CV Builder...', 'success');
      
      // Open CV builder with data ID in URL
      setTimeout(() => {
        const dataId = result.dataId;
        const cvBuilderUrl = dataId 
          ? `${targetUrl}/cv-builder?import=${dataId}`
          : `${targetUrl}/cv-builder`;
        chrome.tabs.create({ url: cvBuilderUrl });
      }, 1000);
    } else {
      const error = await response.text();
      showMessage(`Error: ${response.status} - ${error}`, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Failed to send data. Is JobPrep running?', 'error');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = '⬆️ Send to JobPrep';
  }
});

// Load previously extracted data if available
chrome.storage.local.get(['extractedData'], (result) => {
  if (result.extractedData) {
    extractedData = result.extractedData;
    showPreview(extractedData);
    sendBtn.disabled = false;
    showMessage('Using previously extracted data', 'info');
  }
});
