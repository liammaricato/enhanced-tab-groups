const pendingUpdates = {}

async function init(key, defaultValue) {
  const result = await chrome.storage.local.get([key])
  if (result[key]) return result[key]
  
  await save(key, defaultValue)
  return defaultValue
}

function save(key, value) {
  chrome.storage.local.set({ [key]: value })
}

function saveById(key, id, value) {
  // TODO: Add debouncing later when auto-sync is implemented
  chrome.storage.local.set({ [`${key}:${id}`]: value })
}

export default {
  init,
  save,
  saveById,
}