// Background service worker for JobPrep LinkedIn CV Importer

console.log('JobPrep LinkedIn Importer - Background service worker started');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    
    // Set default target URL
    chrome.storage.local.set({ targetUrl: 'http://localhost:3000' });
    
    // Open welcome page (optional)
    // chrome.tabs.create({ url: 'http://localhost:3000/cv-builder' });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveData') {
    // Save extracted data to storage
    chrome.storage.local.set({ extractedData: request.data }, () => {
      console.log('Data saved to storage');
      sendResponse({ success: true });
    });
    return true; // Keep message channel open
  }
  
  if (request.action === 'getData') {
    // Retrieve extracted data from storage
    chrome.storage.local.get(['extractedData'], (result) => {
      sendResponse({ success: true, data: result.extractedData });
    });
    return true; // Keep message channel open
  }
  
  if (request.action === 'clearData') {
    // Clear stored data
    chrome.storage.local.remove(['extractedData'], () => {
      console.log('Data cleared from storage');
      sendResponse({ success: true });
    });
    return true; // Keep message channel open
  }
});

// Update badge when data is extracted
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.extractedData) {
    if (changes.extractedData.newValue) {
      // Data extracted - show badge
      chrome.action.setBadgeText({ text: '1' });
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    } else {
      // Data cleared - hide badge
      chrome.action.setBadgeText({ text: '' });
    }
  }
});
