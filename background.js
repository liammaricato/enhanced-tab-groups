import { getCurrentGroup, syncGroup, spawnGroup, searchGroups } from './groups.js'

// Handle message events
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message).then(data => {
    sendResponse({ success: true, data })
  }).catch(error => {
    sendResponse({ success: false, error: error.message })
  })
})

async function handleMessage(message) {
  if (message.type === 'getCurrentGroup') return getCurrentGroup()
  if (message.type === 'syncGroup') return syncGroup(message.data)
  if (message.type === 'spawnGroup') return spawnGroup(message.data)
  if (message.type === 'searchGroups') return searchGroups(message.data)

  throw new Error(`Unknown message type: ${message.type}`)
}
