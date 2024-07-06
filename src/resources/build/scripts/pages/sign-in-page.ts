const signInPage_pageMain = document.querySelector('#page-main') as HTMLElement
const typePasswordSection = signInPage_pageMain.querySelector(
    '.type-password-section',
) as HTMLElement
const formGroup = typePasswordSection.querySelector('.form-group') as HTMLElement
const inputMessage = typePasswordSection.querySelector('.input-message') as HTMLElement
const signInMessage = typePasswordSection.querySelector('.sign-in-message') as HTMLElement

const hideShowPassword_signInPage = (target: HTMLElement, isShown: boolean): void => {
    const inputWrapper = target.closest('.input-wrapper') as HTMLInputElement
    const hiddenBtn = inputWrapper.querySelector('.input-actions .hidden')
    const shownBtn = inputWrapper.querySelector('.input-actions .shown')
    if (isShown) {
        inputWrapper.querySelector('input')!.type = 'password'
        hiddenBtn!.classList.remove('inactive')
        shownBtn!.classList.add('inactive')
    } else {
        inputWrapper.querySelector('input')!.type = 'text'
        hiddenBtn!.classList.add('inactive')
        shownBtn!.classList.remove('inactive')
    }
}

const handleOnBlurTypePasswordInput = (target: HTMLInputElement): void => {
    if (target.value) return
    target.parentElement!.querySelector('.input-placeholder')!.innerHTML = 'Type password...'
}

const handleOnFocusTypePasswordInput = (target: HTMLInputElement): void => {
    target.parentElement!.querySelector('.input-placeholder')!.innerHTML = ''
}

const signIn = async (password: string, noteUniqueName: string): Promise<void> => {
    if (NOTE_UNIQUE_NAME_REGEX.test(noteUniqueName)) {
        await signInAPI(password, noteUniqueName)
    }
}

const setSignInMessage = (message: string | null): void => {
    signInMessage.innerHTML = message
        ? `
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>${message}</span>`
        : ''
}

const setInputMessage = (message: string | null): void => {
    inputMessage.innerHTML = message
        ? `
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>${message}</span>`
        : ''
}

const typingPassword = () => {
    setInputMessage(null)
}

const validateInputValue = (inputValue: string): boolean => {
    let valid = true
    if (!inputValue) {
        valid = false
        setInputMessage('Please enter your password!')
    } else {
        setInputMessage(null)
    }
    return valid
}

const signInHandler = async (target: HTMLButtonElement | HTMLInputElement): Promise<void> => {
    const password = (formGroup.querySelector('.input-wrapper input') as HTMLInputElement).value
    setSignInMessage(null)

    if (validateInputValue(password)) {
        const submitBtn = target
            .closest('.type-password-section')!
            .querySelector('.submit-btn') as HTMLButtonElement
        const htmlBefore = submitBtn.innerHTML
        submitBtn.innerHTML = Materials.createHTMLLoading('grow')
        submitBtn.classList.add('on-progress')

        const noteUniqueName = getNoteUniqueNameFromURL()

        let apiSuccess: boolean = false
        try {
            await signIn(password, noteUniqueName)
            apiSuccess = true
        } catch (error) {
            if (error instanceof Error) {
                const err = APIErrorHandler.handleError(error)
                setSignInMessage(err.message)
            }
        }

        if (apiSuccess) {
            redirectAfterMs(300, `/${noteUniqueName}`)
            LayoutController.setUIOfGeneralAppStatus('success')
        }
        submitBtn.classList.remove('on-progress')
        submitBtn.innerHTML = htmlBefore
    }
}

const catchEnterKeyOfSignInInput = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
        signInHandler(e.target as HTMLInputElement)
    }
}
