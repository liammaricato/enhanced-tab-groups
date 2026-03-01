import StorageApi from './storageApi.js'

const storage = new StorageApi()

// Set current group when active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  storage.setCurrentGroup(null)

  chrome.tabs.get(activeInfo.tabId)
    .then(tab => {
      if (tab.groupId > 0) {
        return chrome.tabGroups.get(tab.groupId)
      } else {
        return null
      }
    })
    .then(group => storage.setCurrentGroup(group))
})

// Handle 'spawnGroup' event to spawn a new group with its tabs
async function spawnGroup(group) {
  const tabs = await Promise.all(group.tab_urls.map(url => {
    return chrome.tabs.create({ url: url })
  }))

  group.id = await chrome.tabs.group({tabIds: tabs.map(tab => tab.id) })
  await chrome.tabGroups.update(group.id, { title: group.title, color: group.color })
}

// Handle message events
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    handleMessage(message)
    sendResponse({ success: true })
  } catch (error) {
    sendResponse({ success: false, error: error.message })
  }
})

function handleMessage(message) {
  if (message.type === 'syncGroup') return storage.syncGroup(message.data)
  if (message.type === 'spawnGroup') return spawnGroup(message.data)

  throw new Error('Unknown message type: ' + message.type)
}
