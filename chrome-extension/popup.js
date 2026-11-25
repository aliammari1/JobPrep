// Manifest V3 popup controller for JobPrep Career & LinkedIn Companion
// Uses async/await throughout with zero inline event handlers.

const DEFAULT_TARGET_URL = "http://localhost:3000";

const statusBox = document.getElementById("statusBox");
const previewBox = document.getElementById("previewBox");
const sendRow = document.getElementById("sendRow");
const targetUrlInput = document.getElementById("targetUrlInput");
const oauthBtn = document.getElementById("oauthBtn");
const pdfImportBtn = document.getElementById("pdfImportBtn");
const extractBtn = document.getElementById("extractBtn");
const openCvBtn = document.getElementById("openCvBtn");
const clearBtn = document.getElementById("clearBtn");
const saveUrlBtn = document.getElementById("saveUrlBtn");

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.className = isError ? "status visible error" : "status visible";
}

function renderPreview(data) {
  if (!data) {
    previewBox.className = "preview";
    previewBox.textContent = "";
    sendRow.style.display = "none";
    return;
  }

  const name = data.personalInfo?.fullName || "Profile captured";
  const expCount = Array.isArray(data.experience) ? data.experience.length : 0;
  const eduCount = Array.isArray(data.education) ? data.education.length : 0;
  const skillCount = Array.isArray(data.skills) ? data.skills.length : 0;

  previewBox.textContent = "";
  const strong = document.createElement("strong");
  strong.textContent = name;
  previewBox.appendChild(strong);
  previewBox.appendChild(
    document.createTextNode(
      ` — ${expCount} roles · ${eduCount} education · ${skillCount} skills`,
    ),
  );
  previewBox.className = "preview visible";
  sendRow.style.display = "flex";
}

async function getTargetUrl() {
  const { targetUrl = DEFAULT_TARGET_URL } = await chrome.storage.local.get([
    "targetUrl",
  ]);
  return targetUrl.replace(/\/+$/, "");
}

async function init() {
  const { targetUrl = DEFAULT_TARGET_URL, extractedData = null } =
    await chrome.storage.local.get(["targetUrl", "extractedData"]);
  targetUrlInput.value = targetUrl;
  renderPreview(extractedData);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isLinkedInProfile = Boolean(
    tab?.url && /^https:\/\/([a-z0-9-]+\.)?linkedin\.com\/in\//i.test(tab.url),
  );
  if (!isLinkedInProfile) {
    extractBtn.disabled = true;
    extractBtn.textContent = "Open a linkedin.com/in/ profile tab";
  }
}

saveUrlBtn.addEventListener("click", async () => {
  const raw = targetUrlInput.value.trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("URL must start with http:// or https://");
    }
    await chrome.storage.local.set({ targetUrl: parsed.origin });
    targetUrlInput.value = parsed.origin;
    showStatus(`Saved instance URL: ${parsed.origin}`);
  } catch {
    showStatus("Enter a valid http:// or https:// JobPrep URL.", true);
  }
});

oauthBtn.addEventListener("click", async () => {
  const baseUrl = await getTargetUrl();
  await chrome.tabs.create({ url: `${baseUrl}/settings/connected-accounts` });
});

pdfImportBtn.addEventListener("click", async () => {
  const baseUrl = await getTargetUrl();
  await chrome.tabs.create({ url: `${baseUrl}/cv-builder` });
});

extractBtn.addEventListener("click", async () => {
  extractBtn.disabled = true;
  showStatus("Capturing visible profile sections…");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) {
      throw new Error("No active browser tab found.");
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractLinkedInProfile",
    });

    if (!response?.success || !response.data) {
      throw new Error(
        response?.error || "Could not read profile. Refresh the tab and retry.",
      );
    }

    await chrome.runtime.sendMessage({
      action: "saveData",
      data: response.data,
      sourceUrl: tab.url,
    });

    renderPreview(response.data);
    showStatus("Profile captured locally. Open CV Builder to import.");
  } catch (error) {
    showStatus(
      error instanceof Error ? error.message : "Failed to capture profile.",
      true,
    );
  } finally {
    extractBtn.disabled = false;
  }
});

openCvBtn.addEventListener("click", async () => {
  const baseUrl = await getTargetUrl();
  await chrome.tabs.create({ url: `${baseUrl}/cv-builder?import=extension` });
});

clearBtn.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ action: "clearData" });
  renderPreview(null);
  showStatus("Cleared locally stored profile data.");
});

init().catch((err) => {
  showStatus(
    err instanceof Error ? err.message : "Failed to initialize popup.",
    true,
  );
});
