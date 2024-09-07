'use strict'
const signInPage_pageMain = document.querySelector('#page-main')
const typePasswordSection = signInPage_pageMain.querySelector('.type-password-section')
const inputMessage = typePasswordSection.querySelector('.input-message')
const signInMessage = typePasswordSection.querySelector('.sign-in-message')
const hideShowPassword_signInPage = (target, isShown) => {
    const inputWrapper = target.closest('.input-wrapper')
    const hiddenBtn = inputWrapper.querySelector('.input-actions .hidden')
    const shownBtn = inputWrapper.querySelector('.input-actions .shown')
    if (isShown) {
        inputWrapper.querySelector('input').type = 'password'
        hiddenBtn.classList.remove('inactive')
        shownBtn.classList.add('inactive')
    } else {
        inputWrapper.querySelector('input').type = 'text'
        hiddenBtn.classList.add('inactive')
        shownBtn.classList.remove('inactive')
    }
}
const handleOnBlurTypePasswordInput = (target) => {
    if (target.value) return
    target.parentElement.querySelector('.input-placeholder').innerHTML = 'Type password...'
}
const handleOnFocusTypePasswordInput = (target) => {
    target.parentElement.querySelector('.input-placeholder').innerHTML = ''
}
const setSignInMessage = (message) => {
    signInMessage.innerHTML = message
        ? `
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>${message}</span>`
        : ''
}
const setInputMessage = (message) => {
    inputMessage.innerHTML = message
        ? `
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>${message}</span>`
        : ''
}
const typingPassword = () => {
    setInputMessage(null)
}
const validateInputValue = (inputValue) => {
    let valid = true
    if (!inputValue) {
        valid = false
        setInputMessage(pageData.emptyPasswordMessage)
    } else {
        setInputMessage(null)
    }
    return valid
}
const signInHandler = async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    const password = formData.get('password')
    setSignInMessage(null)
    if (validateInputValue(password)) {
        const submitBtn = form.closest('.type-password-section').querySelector('.submit-btn')
        const htmlBefore = submitBtn.innerHTML
        submitBtn.innerHTML = Materials.createHTMLLoading('grow')
        submitBtn.classList.add('on-progress')
        const noteUniqueName = getNoteUniqueNameFromURL()
        let apiSuccess = false
        try {
            await signInAPI(password)
            apiSuccess = true
        } catch (error) {
            if (error instanceof Error) {
                const err = HTTPErrorHandler.handleError(error)
                setSignInMessage(err.message)
            }
        }
        if (apiSuccess) {
            redirectAfterMs(300, `/${noteUniqueName}`)
            LayoutController.setGeneralAppStatus('success')
        }
        submitBtn.classList.remove('on-progress')
        submitBtn.innerHTML = htmlBefore
    }
}
const initSignInPage = () => {
    initUserActions()
}
initSignInPage()
