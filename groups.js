import storage from './storage.js'

const GROUPS_KEY = 'groups'

let groups
let sessionGroups

async function startup() {
  groups = await storage.init(GROUPS_KEY, {})
  // sessionGroups = await loadSessionGroups(groups)
  sessionGroups = {}
}

async function getCurrentGroup() {
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  if (tab.groupId <= 0) return null
  
  return fetchGroup(tab.groupId)
}

async function mostRecentGroups() {
  return Object.values(groups).sort((a, b) => b.lastSyncAt - a.lastSyncAt).slice(0, 5)
}

function syncGroup(group) {
  group.save()
}


async function fetchGroup(groupId) {
  let group = sessionGroups[groupId]
  if (group) return group

  groupData = await chrome.tabGroups.get(groupId)
  groupData.tabUrls = await getTabUrls(groupId)
  
  group = await fetchGroupFromStorage(groupData)
  if (group) return group

  group = new Group(groupData)
  sessionGroups[groupId] = group
  return group
}

async function loadSessionGroups(groups) {
  let openedSessionGroups = await chrome.tabGroups.query({})
  
  return openedSessionGroups.reduce((acc, group) => {
    group = new Group(group)

    groups.forEach(group => {
      if (group.isEqual(group)) {
        acc[group.id] = group
        return acc
      }
    })

    return acc
  }, {})
}

async function spawnGroup(group) {
  const tabs = await Promise.all(group.tabUrls.map(url => {
    return chrome.tabs.create({ url: url })
  }))

  sessionId = await chrome.tabs.group({tabIds: tabs.map(tab => tab.id) })
  await chrome.tabGroups.update(sessionId, { title: group.title, color: group.color })
  
  sessionGroups[sessionId] = group
}

async function fetchGroupFromStorage(groupData) {

}

function getTabUrls(groupId) {
  return chrome.tabs.query({ groupId: groupId })
                    .then(tabs => tabs.map(tab => tab.url))
}

async function searchGroups(query) {
  return Object.values(sessionGroups).filter(group => {
    return group.title.toLowerCase().includes(query.toLowerCase())
  })
}

export default {
  startup,
  getCurrentGroup,
  mostRecentGroups,
  syncGroup,
  searchGroups,
  spawnGroup,
}