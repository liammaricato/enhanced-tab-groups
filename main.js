const USERNAME_KEY = 'google-forms-ext-username-input'
const CHECKS_KEY = 'google-forms-ext-checks-input'

let username = null
let checks = null

chrome.storage.onChanged.addListener((changes) => {
    for (let [key, { newValue }] of Object.entries(changes)) {
        if (key === USERNAME_KEY) {
            username = newValue
        } else if (key === CHECKS_KEY) {
            checks = newValue?.split(',')?.map(check => check.trim())
        }
    }

    handleBubbleDisplay()
});

async function main() {
    console.log('Loading GoogleForms Autofill Extension...')

    const result = await chrome.storage.local.get([USERNAME_KEY, CHECKS_KEY])
    username = result[USERNAME_KEY]
    checks = result[CHECKS_KEY]?.split(',')?.map(check => check.trim())

    handleBubbleDisplay()
}

function handleBubbleDisplay() {
    if (username && username.length > 0 && checks && checks.length > 0 && checks[0] !== '') {
        if (!document.getElementById('autofill-bubble')) injectBubbleEl()
    } else {
        document.getElementById('autofill-bubble')?.remove()
    }
}

function injectBubbleEl() {
    const bubbleEl = document.createElement('div')
    bubbleEl.id = 'autofill-bubble'
    bubbleEl.textContent = '⚡️'
    bubbleEl.addEventListener('click', triggerAutofill)

    document.body.appendChild(bubbleEl)
}

function triggerAutofill() {
    console.log('Triggering autofill...')
	const startTimeMs = performance.now()

    try {
        if (!username || !checks) {
            alert('No username or checks found! Aborting autofill!')
            return
        }

        let usernameSection = null
        document.querySelectorAll('form div[role=listitem] div[role=heading]').forEach(item => {
            if (item.textContent.includes('@')) {
                usernameSection = item.parentElement.parentElement.parentElement
                return
            }
        })

        // Fill username on the usernameSection's input
        const usernameInput = usernameSection.querySelector('input[type=text]')
        setValueAndTriggerEvents(usernameInput, username)

        const checkboxes = document.querySelectorAll('form div[role=listitem] div[role=checkbox]')
        let checked = []
        checkboxes.forEach(checkbox => {
            checkboxValue = checkbox.getAttribute('data-answer-value').trim()
            if (checks.includes(checkboxValue)) {
                checkbox.click()
                checked.push(checkboxValue)
            }
        })

        if (checked.length === 0) {
            alert('No checks were filled! Aborting autofill!')
            return
        }

        if (checked.length !== checks.length) {
            console.log(`Only ${checked.length} of ${checks.length} checks were filled!`)
        }

        // Submit the form
        document.querySelector('form div[role=button][aria-label="Submit"] span').click()

		const elapsedMs = Math.round(performance.now() - startTimeMs)
		console.log(`Autofill triggered successfully in ${elapsedMs} ms!`)
    } catch (error) {
        console.error('Error triggering autofill:', error)
        alert('Triggering autofill was not successful:', error)
        return
    }
}

// Helper function to set value of input element and trigger events
function setValueAndTriggerEvents(inputEl, value) {
    inputEl.value = value
    inputEl.dispatchEvent(new Event('input', { bubbles: true }))
    inputEl.dispatchEvent(new Event('change', { bubbles: true }))
}

main()