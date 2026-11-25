// Manifest V3 service worker for JobPrep Career & LinkedIn Companion
// Stateless: all state lives in chrome.storage.local

const DEFAULT_TARGET_URL = "http://localhost:3000";

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    const existing = await chrome.storage.local.get(["targetUrl"]);
    if (!existing.targetUrl) {
      await chrome.storage.local.set({
        targetUrl: DEFAULT_TARGET_URL,
        extractionHistory: [],
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.action === "saveData") {
        const dataToSave = {
          ...request.data,
          extractedAt: new Date().toISOString(),
          sourceUrl: sender.url || request.sourceUrl || null,
        };
        await chrome.storage.local.set({ extractedData: dataToSave });
        sendResponse({ success: true, data: dataToSave });
        return;
      }

      if (request.action === "getData") {
        const { extractedData = null } = await chrome.storage.local.get([
          "extractedData",
        ]);
        sendResponse({ success: true, data: extractedData });
        return;
      }

      if (request.action === "clearData") {
        await chrome.storage.local.remove(["extractedData"]);
        sendResponse({ success: true });
        return;
      }

      if (request.action === "setTargetUrl") {
        const sanitized = String(request.targetUrl || DEFAULT_TARGET_URL)
          .trim()
          .replace(/\/+$/, "");
        await chrome.storage.local.set({ targetUrl: sanitized });
        sendResponse({ success: true, targetUrl: sanitized });
        return;
      }

      if (request.action === "getTargetUrl") {
        const { targetUrl = DEFAULT_TARGET_URL } =
          await chrome.storage.local.get(["targetUrl"]);
        sendResponse({ success: true, targetUrl });
        return;
      }

      sendResponse({ success: false, error: "Unknown action" });
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  })();

  return true; // keep message channel open for async response
});

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace !== "local" || !changes.extractedData) return;

  if (changes.extractedData.newValue) {
    const data = changes.extractedData.newValue;
    const firstName = data.personalInfo?.fullName?.split(" ")[0] || "Ready";
    await chrome.action.setBadgeText({ text: "✓" });
    await chrome.action.setBadgeBackgroundColor({ color: "#2563EB" });
    await chrome.action.setTitle({ title: `JobPrep — Ready: ${firstName}` });
  } else {
    await chrome.action.setBadgeText({ text: "" });
    await chrome.action.setTitle({ title: "JobPrep Career Companion" });
  }
});
