// Background script for TabMaster extension

// Track tab usage statistics
const tabStats = {};

// Initialize when extension is installed
chrome.runtime.onInstalled.addListener(function() {
  console.log('TabMaster extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    autoSuspendMinutes: 30,
    maxTabsBeforeWarning: 15,
    enableTabGroups: true,
    enableTabStats: true
  });
});

// Listen for tab creation
chrome.tabs.onCreated.addListener(function(tab) {
  // Track when the tab was created
  tabStats[tab.id] = {
    created: Date.now(),
    lastAccessed: Date.now(),
    accessCount: 1
  };
  
  // Check if we've exceeded the tab warning threshold
  chrome.storage.sync.get('maxTabsBeforeWarning', function(data) {
    const maxTabs = data.maxTabsBeforeWarning || 15;
    
    chrome.tabs.query({}, function(tabs) {
      if (tabs.length > maxTabs) {
        // Show icon badge with tab count
        chrome.action.setBadgeText({ text: tabs.length.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
      }
    });
  });
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener(function(tabId) {
  // Clean up tab stats
  if (tabStats[tabId]) {
    delete tabStats[tabId];
  }
  
  // Update badge
  chrome.tabs.query({}, function(tabs) {
    if (tabs.length <= 15) {
      chrome.action.setBadgeText({ text: '' });
    } else {
      chrome.action.setBadgeText({ text: tabs.length.toString() });
    }
  });
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(function(activeInfo) {
  const tabId = activeInfo.tabId;
  
  // Update tab stats
  if (tabStats[tabId]) {
    tabStats[tabId].lastAccessed = Date.now();
    tabStats[tabId].accessCount++;
  } else {
    tabStats[tabId] = {
      created: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1
    };
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "suspendTab") {
    const tabId = request.tabId;
    const suspendHTML = request.suspendHTML;
    
    chrome.tabs.update(tabId, {
      url: "data:text/html;charset=utf-8," + encodeURIComponent(suspendHTML)
    }, function() {
      if (chrome.runtime.lastError) {
        sendResponse({success: false, error: chrome.runtime.lastError.message});
      } else {
        sendResponse({success: true});
      }
    });
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});
