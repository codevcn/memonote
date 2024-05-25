'use strict'
const pageMain_sigInPage = document.querySelector('#page-main')
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
    const inputPlaceholder = target.nextElementSibling
    inputPlaceholder.hidden = false
}
const handleOnFocusTypePasswordInput = (target) => {
    const inputPlaceholder = target.nextElementSibling
    inputPlaceholder.hidden = true
}
