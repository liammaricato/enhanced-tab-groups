const currentGroupEl = document.getElementById('current-group')
const currentGroupTitleEl = document.getElementById('current-group-title')
const syncGroupButtonEl = document.getElementById('sync-group-button')
const spawnGroupButtonEl = document.getElementById('spawn-group-button')

let currentGroup

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

// Sync group button click handler
// Persists current group state to storage
syncGroupButtonEl.addEventListener('click', () => {
	syncGroupButtonEl.disabled = true
	syncGroupButtonEl.textContent = 'Syncing...'
	
	chrome.runtime.sendMessage({ type: 'syncGroup', data: currentGroup }, (response) => {
		if (response.success) {
			syncGroupButtonEl.textContent = 'Synced'
		} else {
			syncGroupButtonEl.textContent = 'Sync error'
		}
	})
})

// Spawn group button click handler
// Spawns a new group with its tabs
spawnGroupButtonEl.addEventListener('click', () => {
	spawnGroupButtonEl.disabled = true
	spawnGroupButtonEl.textContent = 'Spawning...'

	let group = {
		title: 'Test Group',
		color: 'red',
		tab_urls: ['https://www.google.com', 'https://www.youtube.com'],
	}

	chrome.runtime.sendMessage({ type: 'spawnGroup', data: group }, (response) => {
		if (response.success) {
			spawnGroupButtonEl.textContent = 'Spawned'
			spawnGroupButtonEl.disabled = false
		} else {
			spawnGroupButtonEl.textContent = 'Spawn error'
		}
	})
})
