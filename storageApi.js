const GROUPS_KEY = 'groups'
const CURRENT_GROUP_KEY = 'currentGroup'

class StorageApi {
  constructor() {
    chrome.storage.local.get([GROUPS_KEY], (result) => {
      if (result[GROUPS_KEY]) {
        this.groups = JSON.parse(result[GROUPS_KEY])
      } else {
        this.groups = {}
        this.storeGroups()
      }
    })
  }

  storeGroups() {
    chrome.storage.local.set({ [GROUPS_KEY]: JSON.stringify(this.groups) })
  }

  syncGroup(rawGroup) {
    const group = {
      id: new Date().getTime(),
      title: rawGroup.title,
      color: rawGroup.color,
      // TODO: Take tab_urls from chrome.tabs.get(tab.id)
      // tab_urls: rawGroup.tab_urls,
      tab_urls: ['https://www.google.com', 'https://www.youtube.com'],
      chrome_id: rawGroup.id,
    }
    this.groups[group.id] = group
    this.storeGroups()
  }

  setCurrentGroup(group) {
    chrome.storage.sync.set({ [CURRENT_GROUP_KEY]: group })
  }

  searchGroups(query) {
    return Object.values(this.groups).filter(group => {
      return group.title.toLowerCase().includes(query.toLowerCase())
        // || group.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        // TODO: Implement tags and later indexing for faster search
    })
  }
}

const storage = new StorageApi()
export default storage