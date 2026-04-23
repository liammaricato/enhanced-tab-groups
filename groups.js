const GROUPS_KEY = 'groups'

let groups = await storage.init(GROUPS_KEY, {})
let sessionGroups

// async function syncGroup(rawGroup) {
//   let group = sessionGroups[rawGroup.id]
  
//   if (!group) {
//     syncSession()
//     group = sessionGroups[rawGroup.id]
    
//     if (!group) throw new Error(`Group ${rawGroup.id} not found in session`)
//   }

//   await group.upsert(rawGroup)
//   sessionGroups[rawGroup.id] = group
// }

function syncGroup(group) {
  group.save()
}

async function getCurrentGroup() {
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  if (tab.groupId <= 0) return null
  
  return fetchGroup(tab.groupId)
}

async function fetchGroup(groupId) {
  let group = sessionGroups[groupId]
  if (group) return group

  groupData = await chrome.tabGroups.get(groupId)
  groupData.tab_urls = await getTabUrls(groupId)
  
  group = await fetchGroupFromStorage(groupData)
  if (group) return group

  group = new Group(groupData)
  sessionGroups[groupId] = group
  return group
}

async function spawnGroup(group) {
  const tabs = await Promise.all(group.tab_urls.map(url => {
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
  syncGroup,
  spawnGroup,
  syncSession,
  getCurrentGroup,
}