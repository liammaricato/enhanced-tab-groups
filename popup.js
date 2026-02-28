const USERNAME_INPUT_ID = 'google-forms-ext-username-input'
const CHECKS_INPUT_ID = 'google-forms-ext-checks-input'

const usernameInput = document.getElementById(USERNAME_INPUT_ID)
const checksInput = document.getElementById(CHECKS_INPUT_ID)

chrome.storage.local.get([USERNAME_INPUT_ID, CHECKS_INPUT_ID], (result) => {
	usernameInput.value = result[USERNAME_INPUT_ID] || ''
	checksInput.value = result[CHECKS_INPUT_ID] || ''
})

usernameInput.addEventListener('change', () => persistOnStorage(usernameInput))
checksInput.addEventListener('change', () => persistOnStorage(checksInput))

function persistOnStorage(inputEl) {
	const toSave = {}
	toSave[inputEl.id] = inputEl.value
	chrome.storage.local.set(toSave)
}