import storage from '../storage.js'

const GROUPS_KEY = 'groups'

export default class Group {
  constructor(groupData) {
    this.id = groupData.id || new Date().getTime()
    this.title = groupData.title
    this.color = groupData.color
    this.tabUrls = groupData.tabUrls
    this.lastSyncAt = groupData.lastSyncAt || null
  }

  save() {
    this.lastSyncAt = new Date()
    storage.saveById(GROUPS_KEY, this.id, this)
  }

  update(groupData) {
    this.title = groupData.title
    this.color = groupData.color
    this.tabUrls = groupData.tabUrls
  }

  isEqual(other) {
    return this.diff(other).every(diff => diff === false)
  }

  diff(other) {
    tabUrlsDiff = this.tabUrls.length !== other.tabUrls.length ||
                    this.tabUrls.some((url, index) => url !== other.tabUrls[index])

    return {
      title: this.title !== other.title,
      color: this.color !== other.color,
      tabUrls: tabUrlsDiff,
    }
  }
}