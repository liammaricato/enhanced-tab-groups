const GROUPS_KEY = 'groups'
const CURRENT_GROUP_KEY = 'currentGroup'

export default class StorageApi {
  constructor() {
    chrome.storage.local.get([GROUPS_KEY], (result) => {
      if (result[GROUPS_KEY]) {
        this.groups = JSON.parse(result[GROUPS_KEY])
      } else {
        this.groups = {}
        this.syncGroups()
      }
    })
  }

  syncGroups() {
    chrome.storage.local.set({ [GROUPS_KEY]: JSON.stringify(this.groups) })
  }

  syncGroup(group) {
    this.groups[group.id] = {...group, last_sync_at: new Date().toISOString()}
    this.syncGroups()
  }

  setCurrentGroup(group) {
    chrome.storage.sync.set({ [CURRENT_GROUP_KEY]: group })
  }

  // getGroups() {
  //   if (!this.groups) {
  //     throw new Error('Groups not yet initialized')
  //   }

  //   return this.groups
  // }

  // searchGroups(query) {
  //   return Object.values(this.groups).filter(group => {
  //     return group.name.toLowerCase().includes(query.toLowerCase()) ||
  //       group.display_name.toLowerCase().includes(query.toLowerCase()) ||
  //       group.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  //   })
  // }
}