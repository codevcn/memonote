const pageMain_sigInPage = document.querySelector('#page-main') as HTMLElement

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
    const inputPlaceholder = target.nextElementSibling as HTMLElement
    inputPlaceholder.hidden = false
}

const handleOnFocusTypePasswordInput = (target: HTMLInputElement): void => {
    const inputPlaceholder = target.nextElementSibling as HTMLElement
    inputPlaceholder.hidden = true
}
