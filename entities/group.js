import storage from '../storage.js'

const GROUPS_KEY = 'groups'

export default class Group {
  constructor(groupData) {
    this.id = groupData.id || new Date().getTime()
    this.title = groupData.title
    this.color = groupData.color
    this.tab_urls = groupData.tab_urls
    this.lastSyncedAt = groupData.lastSyncedAt || null
  }

  save() {
    this.lastSyncedAt = new Date()
    storage.saveById(GROUPS_KEY, this.id, this)
  }

  update(groupData) {
    this.title = groupData.title
    this.color = groupData.color
    this.tab_urls = groupData.tab_urls
  }

  diff(other) {
    tab_urls_diff = this.tab_urls.length !== other.tab_urls.length ||
                    this.tab_urls.some((url, index) => url !== other.tab_urls[index])

    return {
      title: this.title !== other.title,
      color: this.color !== other.color,
      tab_urls: tab_urls_diff,
    }
  }
}