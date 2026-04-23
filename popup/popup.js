const currentGroupEl = document.getElementById('current-group')
const currentGroupTitleEl = document.getElementById('current-group-title')
const syncGroupButtonEl = document.getElementById('sync-group-button')
const spawnGroupButtonEl = document.getElementById('spawn-group-button')
const groupsListEl = document.getElementById('groups-list')
const searchGroupsInputEl = document.getElementById('search-groups-input')

let currentGroup
let allGroups

// Load current group on startup
chrome.storage.sync.get('currentGroup')
	.then(result => setCurrentGroup(result.currentGroup))

// Set current group in UI
function setCurrentGroup(group) {
	if (!group) return currentGroupEl.style.display = 'none'

	currentGroup = group
	currentGroupEl.style.display = 'flex'
	currentGroupTitleEl.textContent = group.title
	currentGroupTitleEl.style.backgroundColor = group.color
}

// Load all groups on startup
chrome.storage.local.get('groups').then(result => {
  allGroups = JSON.parse(result.groups)
  loadGroups(Object.values(allGroups))
})

function loadGroups(groups) {
  groupsListEl.innerHTML = ''
  groupsListEl.classList.add('loading')
  groups.forEach(group => insertGroupItem(group))
  groupsListEl.classList.remove('loading')
}

// Sync group button click handler
// Persists current group state to storage
syncGroupButtonEl.addEventListener('click', () => {
	syncGroupButtonEl.disabled = true
	syncGroupButtonEl.textContent = 'Syncing...'
	
	chrome.runtime.sendMessage({ type: 'syncGroup', data: currentGroup }, (response) => {
		if (response.success) {
			syncGroupButtonEl.textContent = 'Synced'
      loadGroups()
		} else {
			syncGroupButtonEl.textContent = 'Sync error'
		}
	})
})

// Search groups input change handler
// Generates a list of groups based on the search query
searchGroupsInputEl.addEventListener('input', (event) => {
  setTimeout(() => {
    groupsListEl.classList.add('loading')
    const query = event.target.value
    chrome.runtime.sendMessage({ type: 'searchGroups', data: query }, (response) => {
      groupsListEl.innerHTML = ''
      console.log(response)
      response.data.forEach(group => insertGroupItem(group))
      groupsListEl.classList.remove('loading')
    })
  }, 1000)
})

function insertGroupItem(group) {
  const groupItem = groupItemElement(group)
  groupsListEl.appendChild(groupItem)
}

function groupItemElement(group) {
  const groupItem = document.createElement('div')
  groupItem.classList.add('group-item')
  groupItem.id = `group-item-${group.id}`
  groupItem.innerHTML = `
    <span class="group-item-name">${group.name}</span>
    <span class="group-item-title">${group.title}</span>
  `

  const spawnButton = document.createElement('button')
  spawnButton.classList.add('group-item-spawn-button')
  spawnButton.textContent = 'S'
  spawnButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'spawnGroup', data: group }, (response) => {
      if (!response.success) {
        alert('Failed to spawn group')
      }
    })
  })
  
  const editButton = document.createElement('button')
  editButton.classList.add('group-item-edit-button')
  editButton.textContent = 'E'
  editButton.addEventListener('click', () => openEditGroupModal(group))
  
  const deleteButton = document.createElement('button')
  deleteButton.classList.add('group-item-delete-button')
  deleteButton.textContent = 'D'
  deleteButton.addEventListener('click', () => {
    document.getElementById(`group-item-${group.id}`).remove()
    // TODO: Implement delete group
    // chrome.runtime.sendMessage({ type: 'deleteGroup', data: group })
  })

  groupItem.appendChild(spawnButton)
  groupItem.appendChild(editButton)
  groupItem.appendChild(deleteButton)
  
  return groupItem
}

function openEditGroupModal(group) {
  alert('Edit group modal')
}