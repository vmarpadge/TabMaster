document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const tabCountElement = document.getElementById('tab-count');
  const tabsList = document.getElementById('tabs-list');
  const searchInput = document.getElementById('search-tabs');
  const groupTabsButton = document.getElementById('group-tabs');
  const ungroupTabsButton = document.getElementById('ungroup-tabs');
  const suspendTabsButton = document.getElementById('suspend-tabs');
  const saveSessionButton = document.getElementById('save-session');
  const cleanDuplicatesButton = document.getElementById('clean-duplicates');
  const openSettingsLink = document.getElementById('open-settings');
  
  // Store original tab order
  let originalTabOrder = [];
  
  // Create category cache
  const categoryCache = {};
  
  // Debug logging function
  function logDebug(message, data) {
    const timestamp = new Date().toISOString();
    console.log(`[TabMaster ${timestamp}] ${message}`, data || '');
  }
  
  // Category keywords for smart grouping
  const categoryPatterns = {
    shopping: [
      'amazon', 'ebay', 'walmart', 'etsy', 'shop', 'store', 'buy', 'product', 
      'cart', 'checkout', 'order', 'payment', 'shipping', 'deal', 'price',
      'discount', 'sale', 'offer', 'purchase', 'marketplace', 'ecommerce',
      'shopify', 'aliexpress', 'bestbuy', 'target', 'costco', 'newegg', 'wayfair'
    ],
    social: [
      'facebook', 'twitter', 'instagram', 'linkedin', 'reddit', 'pinterest', 
      'tumblr', 'tiktok', 'snapchat', 'whatsapp', 'messenger', 'chat', 'social',
      'profile', 'friend', 'follow', 'share', 'post', 'tweet', 'feed',
      'discord', 'slack', 'telegram', 'signal', 'wechat', 'clubhouse', 'threads'
    ],
    news: [
      'news', 'article', 'blog', 'post', 'report', 'headline', 'media', 'press',
      'cnn', 'bbc', 'nytimes', 'reuters', 'guardian', 'huffpost', 'washingtonpost',
      'fox', 'msnbc', 'politics', 'world', 'breaking', 'daily', 'times', 'journal',
      'economist', 'bloomberg', 'cnbc', 'aljazeera', 'npr', 'apnews', 'usatoday'
    ],
    tech: [
      'github', 'stackoverflow', 'code', 'programming', 'developer', 'tech', 'api',
      'software', 'hardware', 'app', 'web', 'cloud', 'data', 'server', 'hosting',
      'aws', 'azure', 'google cloud', 'devops', 'javascript', 'python', 'java',
      'react', 'angular', 'vue', 'node', 'docker', 'kubernetes', 'terraform',
      'linux', 'ubuntu', 'windows', 'macos', 'android', 'ios', 'mobile'
    ],
    video: [
      'youtube', 'vimeo', 'netflix', 'hulu', 'disney', 'prime video', 'stream',
      'video', 'movie', 'tv', 'show', 'episode', 'series', 'channel', 'watch',
      'trailer', 'film', 'cinema', 'streaming', 'play', 'hbo', 'peacock',
      'paramount', 'twitch', 'tiktok', 'dailymotion', 'documentary', 'animation'
    ],
    work: [
      'docs', 'sheets', 'slides', 'office', 'excel', 'word', 'powerpoint', 'document',
      'presentation', 'spreadsheet', 'calendar', 'meeting', 'zoom', 'teams', 'slack',
      'email', 'project', 'task', 'trello', 'asana', 'jira', 'confluence',
      'notion', 'airtable', 'monday', 'basecamp', 'clickup', 'todoist', 'wrike',
      'smartsheet', 'workday', 'salesforce', 'hubspot', 'zendesk', 'freshdesk'
    ],
    travel: [
      'booking', 'hotel', 'flight', 'airline', 'travel', 'trip', 'vacation', 'holiday',
      'airbnb', 'expedia', 'tripadvisor', 'map', 'direction', 'location', 'destination',
      'tour', 'cruise', 'resort', 'ticket', 'reservation', 'kayak', 'hostel',
      'airfare', 'travelocity', 'orbitz', 'priceline', 'hotwire', 'vrbo', 'agoda',
      'southwest', 'delta', 'united', 'american airlines', 'british airways'
    ],
    finance: [
      'bank', 'finance', 'money', 'invest', 'stock', 'crypto', 'bitcoin', 'trading',
      'paypal', 'venmo', 'payment', 'transaction', 'account', 'balance', 'budget',
      'credit', 'loan', 'mortgage', 'insurance', 'tax', 'financial', 'banking',
      'fidelity', 'vanguard', 'schwab', 'etrade', 'robinhood', 'coinbase', 'binance',
      'chase', 'wellsfargo', 'citibank', 'bankofamerica', 'capitalone', 'amex'
    ],
    reference: [
      'wiki', 'wikipedia', 'dictionary', 'thesaurus', 'translate', 'definition',
      'encyclopedia', 'reference', 'learn', 'course', 'tutorial', 'guide', 'how to',
      'education', 'university', 'school', 'college', 'academy', 'study',
      'coursera', 'udemy', 'edx', 'khan academy', 'skillshare', 'masterclass',
      'duolingo', 'rosetta stone', 'quizlet', 'chegg', 'britannica'
    ],
    health: [
      'health', 'medical', 'doctor', 'hospital', 'clinic', 'medicine', 'wellness',
      'fitness', 'exercise', 'workout', 'diet', 'nutrition', 'vitamin', 'supplement',
      'yoga', 'meditation', 'mindfulness', 'therapy', 'mental health', 'psychology',
      'webmd', 'mayoclinic', 'healthline', 'cdc', 'who', 'nih', 'cleveland clinic',
      'peloton', 'fitbit', 'myfitnesspal', 'strava', 'calm', 'headspace'
    ],
    gaming: [
      'game', 'gaming', 'play', 'steam', 'epic games', 'playstation', 'xbox', 'nintendo',
      'twitch', 'discord', 'esports', 'mmo', 'rpg', 'fps', 'minecraft', 'fortnite',
      'league of legends', 'dota', 'counter-strike', 'overwatch', 'call of duty',
      'roblox', 'unity', 'unreal engine', 'gamedev', 'walkthrough', 'cheat', 'mod',
      'ign', 'gamespot', 'polygon', 'kotaku', 'pcgamer', 'gamesradar'
    ],
    music: [
      'music', 'song', 'album', 'artist', 'band', 'concert', 'spotify', 'apple music',
      'youtube music', 'pandora', 'soundcloud', 'tidal', 'deezer', 'bandcamp',
      'lyrics', 'playlist', 'radio', 'podcast', 'itunes', 'mp3', 'vinyl', 'guitar',
      'piano', 'drum', 'bass', 'vocal', 'singer', 'composer', 'billboard', 'grammy',
      'pitchfork', 'rolling stone', 'genius'
    ],
    food: [
      'food', 'recipe', 'cook', 'bake', 'restaurant', 'menu', 'meal', 'dinner',
      'lunch', 'breakfast', 'snack', 'dessert', 'drink', 'coffee', 'tea', 'wine',
      'beer', 'cocktail', 'grill', 'kitchen', 'ingredient', 'vegetarian', 'vegan',
      'gluten-free', 'keto', 'paleo', 'organic', 'doordash', 'ubereats', 'grubhub',
      'yelp', 'allrecipes', 'foodnetwork', 'epicurious', 'tasty', 'bonappetit'
    ]
  };
  
  // Load and display all tabs
  function loadTabs() {
    chrome.tabs.query({}, function(tabs) {
      tabCountElement.textContent = tabs.length;
      
      // Store original tab order if it's empty
      if (originalTabOrder.length === 0) {
        originalTabOrder = tabs.map(tab => ({
          id: tab.id,
          windowId: tab.windowId,
          index: tab.index
        }));
      }
      
      displayTabs(tabs);
    });
  }
  
  // Display tabs in the popup with category badges
  function displayTabs(tabs) {
    tabsList.innerHTML = '';
    
    // Process tabs in batches to improve performance
    const batchSize = 15;
    let currentBatch = 0;
    
    function processBatch() {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, tabs.length);
      const fragment = document.createDocumentFragment();
      
      for (let i = start; i < end; i++) {
        const tab = tabs[i];
        const tabItem = document.createElement('li');
        tabItem.className = 'tab-item';
        tabItem.dataset.tabId = tab.id;
        
        const favicon = document.createElement('img');
        favicon.className = 'tab-favicon';
        favicon.src = tab.favIconUrl || 'images/default-favicon.png';
        favicon.onerror = function() {
          this.src = 'images/default-favicon.png';
        };
        
        const titleContainer = document.createElement('div');
        titleContainer.style.display = 'flex';
        titleContainer.style.flexDirection = 'column';
        titleContainer.style.flexGrow = '1';
        titleContainer.style.overflow = 'hidden';
        
        const title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = tab.title;
        
        titleContainer.appendChild(title);
        
        // Determine tab category and add badge if applicable
        const category = determineTabCategory(tab);
        if (category) {
          const badge = document.createElement('span');
          badge.className = `category-badge category-${category}`;
          badge.textContent = category;
          titleContainer.appendChild(badge);
        }
        
        const closeButton = document.createElement('span');
        closeButton.className = 'tab-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function(e) {
          e.stopPropagation();
          chrome.tabs.remove(tab.id);
          tabItem.remove();
          updateTabCount();
        });
        
        tabItem.appendChild(favicon);
        tabItem.appendChild(titleContainer);
        tabItem.appendChild(closeButton);
        
        tabItem.addEventListener('click', function() {
          chrome.tabs.update(tab.id, { active: true });
          chrome.tabs.get(tab.id, function(tab) {
            chrome.windows.update(tab.windowId, { focused: true });
          });
        });
        
        fragment.appendChild(tabItem);
      }
      
      tabsList.appendChild(fragment);
      
      currentBatch++;
      if (currentBatch * batchSize < tabs.length) {
        setTimeout(processBatch, 0);
      }
    }
    
    processBatch();
  }
  
  // Determine tab category based on URL and title
  function determineTabCategory(tab) {
    const url = tab.url ? tab.url.toLowerCase() : '';
    
    // Return from cache if available
    if (categoryCache[url]) {
      return categoryCache[url];
    }
    
    const title = tab.title ? tab.title.toLowerCase() : '';
    const contentToCheck = url + ' ' + title;
    
    for (const [category, keywords] of Object.entries(categoryPatterns)) {
      for (const keyword of keywords) {
        if (contentToCheck.includes(keyword)) {
          // Store in cache
          categoryCache[url] = category;
          return category;
        }
      }
    }
    
    // Store in cache
    categoryCache[url] = 'other';
    return 'other';
  }
  
  // Update tab count
  function updateTabCount() {
    chrome.tabs.query({}, function(tabs) {
      tabCountElement.textContent = tabs.length;
    });
  }
  
  // Search tabs
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    
    chrome.tabs.query({}, function(tabs) {
      const filteredTabs = tabs.filter(function(tab) {
        return tab.title.toLowerCase().includes(query) || 
               (tab.url && tab.url.toLowerCase().includes(query));
      });
      
      displayTabs(filteredTabs);
    });
  });
  
  // Smart group tabs by category
  groupTabsButton.addEventListener('click', function() {
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.classList.add('show');
    
    // Show a message that grouping is in progress
    showNotification("Analyzing and grouping tabs...");
    
    chrome.tabs.query({}, function(tabs) {
      // Group tabs by smart category
      const categories = {};
      
      // First, categorize all tabs
      tabs.forEach(function(tab) {
        try {
          if (!tab.url) return;
          
          const category = determineTabCategory(tab);
          
          if (!categories[category]) {
            categories[category] = [];
          }
          
          categories[category].push(tab);
        } catch (e) {
          console.error("Error processing tab:", e);
        }
      });
      
      // Include all categories, even those with just one tab
      const categoriesToGroup = Object.keys(categories);
      
      if (categoriesToGroup.length === 0) {
        showNotification("No categories found to group.");
        loadingIndicator.classList.remove('show');
        return;
      }
      
      let groupCount = 0;
      
      // Process each category one at a time to avoid Chrome's grouping limitations
      function processNextCategory(index) {
        if (index >= categoriesToGroup.length) {
          // All categories processed
          showNotification(`Smart grouping complete! Created ${groupCount} tab groups.`);
          loadingIndicator.classList.remove('show');
          return;
        }
        
        const category = categoriesToGroup[index];
        const tabIds = categories[category].map(tab => tab.id);
        
        // Skip if no tabs in this category (shouldn't happen but just in case)
        if (tabIds.length === 0) {
          processNextCategory(index + 1);
          return;
        }
        
        // Update loading text
        document.querySelector('.loading-text').textContent = `Grouping ${category} tabs...`;
        
        // Create a group
        try {
          chrome.tabs.group({ tabIds: tabIds }, function(groupId) {
            if (chrome.runtime.lastError) {
              // Continue with next category even if this one failed
              processNextCategory(index + 1);
              return;
            }
            
            // Set group name to category
            chrome.tabGroups.update(groupId, { 
              title: category.charAt(0).toUpperCase() + category.slice(1),
              color: getCategoryColor(category)
            }, function() {
              groupCount++;
              
              // Process next category after a short delay to avoid overwhelming Chrome
              setTimeout(() => {
                processNextCategory(index + 1);
              }, 300);
            });
          });
        } catch (e) {
          processNextCategory(index + 1);
        }
      }
      
      // Start processing categories
      processNextCategory(0);
    });
  });
  
  // Get color for category
  function getCategoryColor(category) {
    const colorMap = {
      'shopping': 'yellow',
      'social': 'blue',
      'news': 'red',
      'tech': 'cyan',
      'video': 'pink',
      'work': 'green',
      'travel': 'purple',
      'finance': 'orange',
      'reference': 'grey',
      'health': 'green',
      'gaming': 'purple',
      'music': 'pink',
      'food': 'red',
      'other': 'grey'
    };
    
    return colorMap[category] || 'blue';
  }
  
  // Show notification
  function showNotification(message) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide and remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  // Ungroup tabs and restore original order
  ungroupTabsButton.addEventListener('click', function() {
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.classList.add('show');
    document.querySelector('.loading-text').textContent = 'Ungrouping tabs...';
    
    showNotification("Ungrouping tabs and restoring original order...");
    
    // First, ungroup all tabs
    chrome.tabs.query({}, function(tabs) {
      // Get all grouped tabs
      const groupedTabs = tabs.filter(tab => tab.groupId !== -1);
      
      if (groupedTabs.length > 0) {
        // Ungroup all tabs
        chrome.tabs.ungroup(groupedTabs.map(tab => tab.id), function() {
          // Now restore original order
          document.querySelector('.loading-text').textContent = 'Restoring original order...';
          restoreOriginalOrder();
        });
      } else {
        // If no grouped tabs, just restore original order
        document.querySelector('.loading-text').textContent = 'Restoring original order...';
        restoreOriginalOrder();
      }
    });
  });
  
  // Restore tabs to their original order
  function restoreOriginalOrder() {
    // Check if we have stored the original order
    if (originalTabOrder.length === 0) {
      showNotification("Original tab order not available.");
      const loadingIndicator = document.getElementById('loading-indicator');
      loadingIndicator.classList.remove('show');
      return;
    }
    
    // Get current tabs
    chrome.tabs.query({}, function(currentTabs) {
      let moveOperations = 0;
      let completedOperations = 0;
      
      // For each tab in our original order
      originalTabOrder.forEach(function(originalTab) {
        // Find if the tab still exists
        const tabStillExists = currentTabs.find(t => t.id === originalTab.id);
        
        if (tabStillExists) {
          moveOperations++;
          
          // Move the tab to its original position
          chrome.tabs.move(originalTab.id, {
            windowId: originalTab.windowId,
            index: originalTab.index
          }, function() {
            completedOperations++;
            
            if (completedOperations === moveOperations) {
              showNotification("Tabs restored to original order!");
              const loadingIndicator = document.getElementById('loading-indicator');
              loadingIndicator.classList.remove('show');
            }
          });
        }
      });
      
      if (moveOperations === 0) {
        showNotification("No tabs to restore to original order.");
        const loadingIndicator = document.getElementById('loading-indicator');
        loadingIndicator.classList.remove('show');
      }
    });
  }
  
  // Suspend inactive tabs
  suspendTabsButton.addEventListener('click', function() {
    showNotification("Suspending inactive tabs...");
    
    chrome.tabs.query({}, function(tabs) {
      // Get current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function(activeTabs) {
        const activeTabId = activeTabs[0].id;
        
        let suspendedCount = 0;
        let tabsToSuspend = tabs.filter(tab => 
          tab.id !== activeTabId && 
          !tab.url.startsWith('chrome://') && 
          !tab.url.startsWith('chrome-extension://') && 
          !tab.url.startsWith('edge://')
        );
        
        if (tabsToSuspend.length === 0) {
          showNotification("No tabs to suspend!");
          return;
        }
        
        // Create a simple HTML page for suspended tabs
        const suspendHTML = `
          <html>
          <head>
            <title>[Suspended] Tab</title>
            <style>
              body {
                font-family: 'Roboto', sans-serif;
                background-color: #232f3e;
                color: #ffffff;
                height: 100vh;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                max-width: 500px;
                padding: 20px;
                background-color: #37475a;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                text-align: center;
              }
              h1 {
                color: #ff9900;
                margin-bottom: 20px;
              }
              button {
                background-color: #ff9900;
                color: #232f3e;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                font-size: 16px;
                margin-top: 20px;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #d5dbdb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Tab suspended by TabMaster</h1>
              <p>This tab has been suspended to save memory.</p>
              <button onclick="location.reload()">Click to reload</button>
              <div class="footer">Created by Vineethkumar Marpadge</div>
            </div>
          </body>
          </html>
        `;
        
        // For each tab to suspend
        tabsToSuspend.forEach(function(tab) {
          // Update the tab with our suspended page
          chrome.tabs.update(tab.id, {
            url: "data:text/html;charset=utf-8," + encodeURIComponent(suspendHTML)
          }, function() {
            suspendedCount++;
            
            if (suspendedCount === tabsToSuspend.length) {
              showNotification(suspendedCount + " tabs suspended!");
            }
          });
        });
      });
    });
  });
  
  // Save session
  saveSessionButton.addEventListener('click', function() {
    chrome.tabs.query({}, function(tabs) {
      const session = {
        date: new Date().toISOString(),
        tabs: tabs.map(tab => ({
          url: tab.url,
          title: tab.title,
          category: determineTabCategory(tab)
        }))
      };
      
      // Save to local storage
      chrome.storage.local.get('savedSessions', function(data) {
        const savedSessions = data.savedSessions || [];
        savedSessions.push(session);
        
        chrome.storage.local.set({ 'savedSessions': savedSessions }, function() {
          showNotification('Session saved! ' + tabs.length + ' tabs stored.');
        });
      });
    });
  });
  
  // Remove duplicate tabs
  cleanDuplicatesButton.addEventListener('click', function() {
    chrome.tabs.query({}, function(tabs) {
      const uniqueUrls = {};
      const duplicates = [];
      
      tabs.forEach(function(tab) {
        if (uniqueUrls[tab.url]) {
          duplicates.push(tab.id);
        } else {
          uniqueUrls[tab.url] = tab.id;
        }
      });
      
      if (duplicates.length > 0) {
        chrome.tabs.remove(duplicates, function() {
          showNotification(duplicates.length + ' duplicate tabs removed!');
          loadTabs();
        });
      } else {
        showNotification('No duplicate tabs found.');
      }
    });
  });
  
  // Open settings page
  openSettingsLink.addEventListener('click', function(e) {
    e.preventDefault();
    // For now, we'll just show a notification since we haven't created a settings page
    showNotification('Settings page will be available in the next version!');
  });
  
  // Initial load
  loadTabs();
  
  // Listen for tab changes
  chrome.tabs.onCreated.addListener(function() {
    loadTabs();
  });
  
  chrome.tabs.onRemoved.addListener(function() {
    loadTabs();
  });
  
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
      loadTabs();
    }
  });
});
