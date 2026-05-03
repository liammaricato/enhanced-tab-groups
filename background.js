import groupsApi from './groups.js'

groupsApi.startup()

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message).then(data => {
    sendResponse({ success: true, data })
  }).catch(error => {
    sendResponse({ success: false, error: error.message })
  })
})

function handleMessage(message) {
  const handler = groupsApi[message.type]
  if (!handler) throw new Error(`Unknown message type: ${message.type}`)
  
  return handler(message.data)
}
