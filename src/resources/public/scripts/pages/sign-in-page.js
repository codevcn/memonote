'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next())
        })
    }
const signInPage_pageMain = document.querySelector('#page-main')
const typePasswordSection = signInPage_pageMain.querySelector('.type-password-section')
const formGroup = typePasswordSection.querySelector('.form-group')
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
const signIn = (password, noteUniqueName) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (noteUniqueNameRegEx.test(noteUniqueName)) {
            yield signInAPI(password, noteUniqueName)
        }
    })
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
const validateInputValue = (inputValue) => {
    let valid = true
    if (!inputValue) {
        valid = false
        setInputMessage('Please type your password!')
    } else {
        setInputMessage(null)
    }
    return valid
}
const signInHandler = (target) =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a
        const password = formGroup.querySelector('.input-wrapper input').value
        setSignInMessage(null)
        if (validateInputValue(password)) {
            const submitBtn =
                (_a = target.closest('.type-password-section')) === null || _a === void 0
                    ? void 0
                    : _a.querySelector('.submit-btn')
            submitBtn.innerHTML = getHTMLLoading('grow')
            submitBtn.classList.add('on-progress')
            let apiSuccess = false
            try {
                yield signIn(password, getNoteUniqueNameFromURL())
                apiSuccess = true
            } catch (error) {
                if (error instanceof Error) {
                    const err = APIErrorHandler.handleError(error)
                    setSignInMessage(err.message)
                }
            }
            if (apiSuccess) {
                refreshPageAfterMs(300)
                LayoutUI.setUIOfGeneralAppStatus('success')
            }
            submitBtn.classList.remove('on-progress')
            submitBtn.innerHTML = `<span>Submit</span>`
        }
    })
const catchEnterKeyOfSignInInput = (e) => {
    if (e.key === 'Enter') {
        signInHandler(e.target)
    }
}
