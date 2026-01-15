// Background service worker for JobPrep LinkedIn CV Importer

console.log("JobPrep LinkedIn Importer - Background service worker started");

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension installed");

    // Set default target URL
    chrome.storage.local.set({
      targetUrl: "https://job-prep-fawn.vercel.app",
      extractionHistory: [],
    });
  } else if (details.reason === "update") {
    console.log(
      "Extension updated to version",
      chrome.runtime.getManifest().version,
    );
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveData") {
    // Save extracted data to storage with timestamp
    const dataToSave = {
      ...request.data,
      extractedAt: new Date().toISOString(),
      sourceUrl: sender.url,
    };

    chrome.storage.local.set({ extractedData: dataToSave }, () => {
      console.log("Data saved to storage");
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "getData") {
    // Retrieve extracted data from storage
    chrome.storage.local.get(["extractedData"], (result) => {
      sendResponse({ success: true, data: result.extractedData });
    });
    return true;
  }

  if (request.action === "clearData") {
    // Clear stored data
    chrome.storage.local.remove(["extractedData"], () => {
      console.log("Data cleared from storage");
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "logError") {
    // Log errors for debugging
    console.error("Extension error:", request.error);
    console.error("Context:", request.context);
    return true;
  }
});

// Update badge when data is extracted
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.extractedData) {
    if (changes.extractedData.newValue) {
      // Data extracted - show badge
      const data = changes.extractedData.newValue;
      const label = data.personalInfo?.fullName
        ? data.personalInfo.fullName.split(" ")[0] // First name
        : "✓";

      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
      chrome.action.setTitle({ title: `Data ready: ${label}` });
    } else {
      // Data cleared - hide badge
      chrome.action.setBadgeText({ text: "" });
      chrome.action.setTitle({ title: "JobPrep LinkedIn CV Importer" });
    }
  }
});
