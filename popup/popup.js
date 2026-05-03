const currentGroupEl = document.getElementById('current-group')
const currentGroupTitleEl = document.getElementById('current-group-title')
const syncGroupButtonEl = document.getElementById('sync-group-button')
const spawnGroupButtonEl = document.getElementById('spawn-group-button')
const groupsListEl = document.getElementById('groups-list')
const searchGroupsInputEl = document.getElementById('search-groups-input')

let currentGroup

function sendMessage(type, data) {
  return chrome.runtime.sendMessage({ type, data });
}

sendMessage("getCurrentGroup").then(group => setCurrentGroup(group))
loadMostRecentGroups()

function setCurrentGroup(group) {
	if (!group) return currentGroupEl.style.display = 'none'

	currentGroup = group
	currentGroupEl.style.display = 'flex'
	currentGroupTitleEl.textContent = group.title
	currentGroupTitleEl.style.backgroundColor = group.color
}

function loadMostRecentGroups(groups) {
  sendMessage("mostRecentGroups").then(groups => loadGroups(groups))
}

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
	
	sendMessage("syncGroup", currentGroup).then(response => {
		if (response.success) {
			syncGroupButtonEl.textContent = 'Synced'
      loadMostRecentGroups()
		} else {
			syncGroupButtonEl.textContent = 'Sync error'
		}
	})
})

// Search groups input change handler
// Generates a list of groups based on the search query
searchGroupsInputEl.addEventListener('input', (event) => {
  if (window._searchDebounce) clearTimeout(window._searchDebounce);
  
  window._searchDebounce = setTimeout(() => {
    groupsListEl.classList.add('loading')
    const query = event.target.value
    sendMessage("searchGroups", query).then(response => {
      groupsListEl.innerHTML = ''
      console.log(response)
      response.data.forEach(group => insertGroupItem(group))
      groupsListEl.classList.remove('loading')
    })
  }, 500);
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