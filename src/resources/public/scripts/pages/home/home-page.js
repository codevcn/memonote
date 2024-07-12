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
const homePage_pageMain = document.querySelector('#page-main')
const notesSection = homePage_pageMain.querySelector('.notes')
const realtimeModeDisplay = document.querySelector('#nav-bar .realtime-mode-display')
const noteSettingsBoard = document.querySelector('#note-settings-modal .note-settings-board')
const settingsModal_logoutBtn = noteSettingsBoard.querySelector(
    '.note-settings-navigation .logout-btn',
)
const setPasswordForm = document.getElementById('settings-form-set-password')
const removePasswordForm = document.getElementById('settings-form-remove-password')
const noteQuickLook = homePage_pageMain.querySelector('.note-quick-look .quick-look-items')
const noteFormEle = notesSection.querySelector('.note-form')
const scrollToTopBtn = document.querySelector('#scroll-to-top')
const noteContentHistory = { history: [''], index: 0 }
const SCROLL_Y_BEGIN = 200
const validateNoteContent = (noteContent) => {
    if (noteContent.length > ENoteLengths.MAX_LENGTH_NOTE_CONTENT) {
        return false
    }
    return true
}
const setNoteContentHistory = (noteContent) => {
    if (!validateNoteContent(noteContent)) return
    let currentHistoryIndex = noteContentHistory.index
    let currentNoteContentHistory = noteContentHistory.history
    if (currentNoteContentHistory[currentHistoryIndex] !== noteContent) {
        if (currentHistoryIndex < currentNoteContentHistory.length - 1) {
            currentNoteContentHistory = currentNoteContentHistory.slice(0, currentHistoryIndex + 1)
        }
        noteContentHistory.history.push(noteContent)
        if (currentNoteContentHistory.length > ENoteLengths.MAX_LENGTH_NOTE_HISTORY) {
            currentNoteContentHistory.shift()
        } else {
            currentHistoryIndex++
        }
    }
    noteContentHistory.history = currentNoteContentHistory
    noteContentHistory.index = currentHistoryIndex
}
const countNoteLetters = (noteEditorTarget, noteContent) => {
    if (!validateNoteContent(noteContent)) return
    noteEditorTarget
        .closest('.note-editor-container')
        .querySelector('.letters-count .count').innerHTML =
        `${noteContent.length} / ${ENoteLengths.MAX_LENGTH_NOTE_CONTENT}`
}
const catchBackspaceWhenTyping = (noteEditorTarget, event) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (event.key === 'Backspace') {
            const noteContent = noteEditorTarget.value
            countNoteLetters(noteEditorTarget, noteContent)
        }
    })
const setBoardUIOfNoteEditor = (noteEditorTarget, noteContent) => {
    if (validateNoteContent(noteContent)) {
        // set height of editor
        noteEditorTarget.parentElement.setAttribute('data-replicated-value', noteContent)
    } else {
        noteEditorTarget.value = noteContentHistory.history[noteContentHistory.history.length - 1]
    }
}
const broadcastNoteContentTypingHanlder = debounce((noteContent) => {
    LayoutController.notifyNoteEdited('off', { content: 'true' })
    broadcastNoteTyping({ content: noteContent })
}, ENoteTyping.NOTE_BROADCAST_DELAY)
const broadcastNoteTitleTypingHanlder = debounce((target) => {
    LayoutController.notifyNoteEdited('off', { title: 'true' })
    broadcastNoteTyping({ title: target.value })
}, ENoteTyping.NOTE_BROADCAST_DELAY)
const broadcastNoteAuthorTypingHanlder = debounce((target) => {
    LayoutController.notifyNoteEdited('off', { author: 'true' })
    broadcastNoteTyping({ author: target.value })
}, ENoteTyping.NOTE_BROADCAST_DELAY)
const noteTyping = (noteEditorTarget) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const noteContent = noteEditorTarget.value
        broadcastNoteContentTypingHanlder(noteContent)
        countNoteLetters(noteEditorTarget, noteContent)
        setNoteContentHistory(noteContent)
        setBoardUIOfNoteEditor(noteEditorTarget, noteContent)
    })
const selectNoteEditorFromInside = (target) => {
    return target
        .closest('.note-form')
        .querySelector('.note-editor-board .note-editor-container .note-editor')
}
const setForNoteFormChanged = (noteForm) => {
    const { author, content, title } = noteForm
    const noteEditor = document.getElementById('note-editor')
    const noteContainer = noteEditor.closest('.note-form')
    if (title || title === '') {
        noteContainer.querySelector('.note-title input').value = title
    }
    if (author || author === '') {
        noteContainer.querySelector('.note-author input').value = author
    }
    if (content || content === '') {
        setNoteEditor(noteEditor, content)
        setBoardUIOfNoteEditor(noteEditor, content)
    }
    countNoteLetters(noteEditor, content || '')
}
const setNoteEditor = (noteEditorTarget, noteContent) => {
    noteEditorTarget.value = noteContent
}
const clearNoteContent = (noteEditorTarget) => {
    setNoteEditor(noteEditorTarget, '')
    countNoteLetters(noteEditorTarget, '')
    setBoardUIOfNoteEditor(noteEditorTarget, '')
}
const copyAllNoteContent = (noteEditorTarget) => {
    navigator.clipboard.writeText(noteEditorTarget.value)
}
const pasteFromClipboard = (noteEditorTarget) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const text = yield navigator.clipboard.readText()
        if (!validateNoteContent(text)) return
        noteEditorTarget.value = text
    })
const undoNoteContent = (noteEditorTarget) => {
    let historyIndex = noteContentHistory.index
    if (historyIndex > 0) {
        historyIndex--
        noteEditorTarget.value = noteContentHistory.history[historyIndex]
    }
    noteContentHistory.index = historyIndex
}
const performUsefulActions = (target, type) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const noteEditor = selectNoteEditorFromInside(target)
        switch (type) {
            case 'clipboardPaste':
                yield pasteFromClipboard(noteEditor)
                break
            case 'copyAllNoteContent':
                copyAllNoteContent(noteEditor)
                return
            case 'clearNoteContent':
                clearNoteContent(noteEditor)
                break
            case 'undoNoteContent':
                undoNoteContent(noteEditor)
                setBoardUIOfNoteEditor(noteEditor, noteEditor.value)
                return
        }
        const updatedNoteEditorValue = noteEditor.value
        setNoteContentHistory(updatedNoteEditorValue)
        setBoardUIOfNoteEditor(noteEditor, updatedNoteEditorValue)
        countNoteLetters(noteEditor, updatedNoteEditorValue)
    })
const hideShowPassword_homePage = (target, isShown) => {
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
const setMessageOfSetPassword = (message, type) => {
    let content
    const messageTarget = setPasswordForm.querySelector('.form-content .form-group .message')
    if (type === 'success') {
        messageTarget.classList.remove('warning', 'valid')
        messageTarget.classList.add('success')
        content = `
            <i class="bi bi-check-circle"></i>
            <span>${message}</span>`
    } else if (type === 'warning') {
        messageTarget.classList.remove('valid', 'success')
        messageTarget.classList.add('warning')
        content = `
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>${message}</span>`
    } else {
        messageTarget.classList.remove('warning', 'success')
        messageTarget.classList.add('valid')
        content = ''
    }
    messageTarget.innerHTML = content
}
const validatePassword = (password) => {
    let is_valid = true
    if (!NOTE_PASSWORD_REGEX.test(password)) {
        is_valid = false
        setMessageOfSetPassword('Please type your password format correctly!', 'warning')
    }
    return is_valid
}
const setPasswordForNote = (password, logoutAll) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const noteUniqueName = getNoteUniqueNameFromURL()
        if (NOTE_UNIQUE_NAME_REGEX.test(noteUniqueName)) {
            yield setPasswordForNoteAPI(password, logoutAll, noteUniqueName)
        }
    })
const setUIOfSetPasswordForm = (type) => {
    let setPasswordLabel
    let showRemovePasswordForm
    if (type === 'add') {
        setPasswordLabel = 'Add Password'
        showRemovePasswordForm = false
    } else {
        setPasswordLabel = 'Change password'
        showRemovePasswordForm = true
    }
    setPasswordForm.querySelector('.form-content .form-group label').innerHTML = setPasswordLabel
    removePasswordForm.querySelector('.form-content-container').hidden = !showRemovePasswordForm
}
const setUIOfRemovePasswordForm = (show) => {
    removePasswordForm.querySelector('.form-content-container').hidden = !show
    removePasswordForm.querySelector('.unset-password-notice').hidden = show
}
const setUIOfLogoutBtn = (show) => {
    settingsModal_logoutBtn.hidden = !show
}
const setUIOfNoteQuickLook = (itemsShown = [], itemsHidden = []) => {
    if (itemsShown.length > 0) {
        for (const itemShown of itemsShown) {
            noteQuickLook.querySelector(`.quick-look-item.${itemShown}`).hidden = false
        }
    }
    if (itemsHidden.length > 0) {
        for (const itemHidden of itemsHidden) {
            noteQuickLook.querySelector(`.quick-look-item.${itemHidden}`).hidden = true
        }
    }
}
const saveSettingsSetPasswordForNote = (e) =>
    __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form)
        const password = formData.get('password')
        const logoutAll = formData.get('logout-all')
        if (validatePassword(password)) {
            const submitBtn = form.querySelector('.form-btn')
            submitBtn.classList.add('on-progress')
            const innerHTML_beforeUpdate = submitBtn.innerHTML
            submitBtn.innerHTML = Materials.createHTMLLoading('border')
            let apiSuccess = false
            try {
                yield setPasswordForNote(password, !!logoutAll)
                apiSuccess = true
            } catch (error) {
                if (error instanceof Error) {
                    const err = HTTPErrorHandler.handleError(error)
                    setMessageOfSetPassword(err.message, 'warning')
                }
            }
            if (apiSuccess) {
                setUIOfLogoutBtn(true)
                setUIOfSetPasswordForm('change')
                setUIOfRemovePasswordForm(true)
                setMessageOfSetPassword('Save password successfully!', 'success')
                setStatusOfSettingsForm(form, 'saved')
                setUIOfNoteQuickLook(['password-set'])
            }
            submitBtn.classList.remove('on-progress')
            submitBtn.innerHTML = innerHTML_beforeUpdate
        }
    })
const removePasswordOfNote = (noteUniqueName) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (NOTE_UNIQUE_NAME_REGEX.test(noteUniqueName)) {
            yield removePasswordForNoteAPI(noteUniqueName)
        }
    })
const saveSettingsRemovePasswordOfNote = (e) =>
    __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault()
        const submitBtn = e.target.querySelector('.form-btn')
        const innerHTML_beforeRemove = submitBtn.innerHTML
        submitBtn.innerHTML = Materials.createHTMLLoading('border')
        let apiSuccess = false
        try {
            yield removePasswordOfNote(getNoteUniqueNameFromURL())
            apiSuccess = true
        } catch (error) {
            if (error instanceof Error) {
                const err = HTTPErrorHandler.handleError(error)
                LayoutController.toast('error', err.message)
            }
        }
        if (apiSuccess) {
            setUIOfSetPasswordForm('add')
            setUIOfRemovePasswordForm(false)
            setUIOfLogoutBtn(false)
            setUIOfNoteQuickLook([], ['password-set'])
        }
        submitBtn.innerHTML = innerHTML_beforeRemove
    })
const logout = (noteUniqueName) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (NOTE_UNIQUE_NAME_REGEX.test(noteUniqueName)) {
            yield logoutAPI(noteUniqueName)
        }
    })
const logoutHandler = (target) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const innerHTML_beforeLogout = target.innerHTML
        target.innerHTML = Materials.createHTMLLoading('border')
        target.classList.add('on-progress')
        let apiSuccess = false
        try {
            yield logout(getNoteUniqueNameFromURL())
            apiSuccess = true
        } catch (error) {
            if (error instanceof Error) {
                const err = HTTPErrorHandler.handleError(error)
                LayoutController.toast('error', err.message)
            }
        }
        if (apiSuccess) {
            refreshPageAfterMs(500)
            LayoutController.setUIOfGeneralAppStatus('success')
        }
        target.classList.remove('on-progress')
        target.innerHTML = innerHTML_beforeLogout
    })
const setStatusOfSettingsForm = (formTarget, type) => {
    const isSaved = type === 'saved'
    formTarget.querySelector('.form-title .status .status-item.saved').hidden = !isSaved
    formTarget.querySelector('.form-title .status .status-item.unsaved').hidden = isSaved
}
const setRealtimeModeHandler = (type) => {
    if (type === 'sync') {
        realtimeModeDisplay.classList.replace('inactive', 'active')
        const currentRealtimeMode = getRealtimeModeInDevice()
        if (!currentRealtimeMode || currentRealtimeMode !== 'sync') {
            fetchNoteContent()
        }
    } else {
        realtimeModeDisplay.classList.replace('active', 'inactive')
    }
    setRealtimeModeInDevice(type)
}
const saveSettingsChangeModes = (e) =>
    __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form)
        const realtimeMode = formData.get('realtime-mode')
        const notifyNoteEditedMode = formData.get('notify-note-edited')
        if (realtimeMode) {
            if (realtimeMode === 'on') {
                setRealtimeModeHandler('sync')
            }
        } else {
            setRealtimeModeHandler('stop')
        }
        if (notifyNoteEditedMode) {
            setNotifyNoteEditedModeInDevice('on')
        } else {
            setNotifyNoteEditedModeInDevice('off')
        }
        setStatusOfSettingsForm(form, 'saved')
    })
const saveSettingsUserInterface = (e) =>
    __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form)
        const editedNotifyStyle = formData.get('edited-notify-style')
        if (editedNotifyStyle) {
            setEditedNotifyStyleInDevice(editedNotifyStyle)
        }
        setStatusOfSettingsForm(form, 'saved')
    })
const scrollToTop = () => {
    if (window.scrollY > SCROLL_Y_BEGIN) {
        window.scrollTo({ top: 100, behavior: 'instant' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}
const initPage = () => {
    // setup "navigate" settings
    const navTabs = noteSettingsBoard.querySelectorAll(
        '.note-settings-navigation .nav-tabs-list .nav-tab',
    )
    for (const navTab of navTabs) {
        navTab.addEventListener('click', function (e) {
            LayoutController.tabNavigator(navTab)
        })
    }
    // setup "change modes" form
    const realtimeMode = getRealtimeModeInDevice()
    if (realtimeMode && realtimeMode === 'sync') {
        const realtimeModeInput = document.getElementById('realtime-mode-input')
        realtimeModeInput.checked = true
        realtimeModeDisplay.classList.replace('inactive', 'active')
    }
    const notifyNoteEditedMode = getNotifyNoteEditedModeInDevice()
    if (notifyNoteEditedMode && notifyNoteEditedMode === 'off') {
        const realtimeModeInput = document.getElementById('notify-note-edited-input')
        realtimeModeInput.checked = false
    }
    const changeModesForm = document.getElementById('settings-form-change-modes')
    const changeModesFormInputs = changeModesForm.querySelectorAll('.form-field')
    for (const input of changeModesFormInputs) {
        input.addEventListener('change', function (e) {
            setStatusOfSettingsForm(changeModesForm, 'unsaved')
        })
    }
    // setup "password" form
    const passwordForm = document.getElementById('settings-form-set-password')
    const passwordFormInputs = passwordForm.querySelectorAll('.form-field')
    for (const input of passwordFormInputs) {
        input.addEventListener('input', function (e) {
            setStatusOfSettingsForm(passwordForm, 'unsaved')
        })
    }
    const passwordFormTabs = noteSettingsBoard.querySelectorAll(
        '.forms.password .nav-tabs-list .nav-tab',
    )
    for (const passwordFormTab of passwordFormTabs) {
        passwordFormTab.addEventListener('click', function (e) {
            LayoutController.tabNavigator(passwordFormTab)
        })
    }
    // setup "user interface" form
    const editedNotifyStyle = getEditedNotifyStyleInDevice()
    const editedNotifyStyleSelect = document.getElementById('edited-notify-style-select')
    if (editedNotifyStyle) {
        const optionExists = Array.from(editedNotifyStyleSelect.options).some(
            (option) => option.value === editedNotifyStyle,
        )
        if (optionExists) {
            editedNotifyStyleSelect.value = editedNotifyStyle
        }
    }
    const userInterfaceForm = document.getElementById('settings-form-user-interface')
    const userInterfaceFormSelects = userInterfaceForm.querySelectorAll('.form-field')
    for (const userInterfaceFormInput of userInterfaceFormSelects) {
        userInterfaceFormInput.addEventListener('change', function (e) {
            setStatusOfSettingsForm(userInterfaceForm, 'unsaved')
        })
    }
    // setup "quick look" section
    const quickLookItems = noteQuickLook.querySelectorAll('.quick-look-item')
    for (const quickLookItem of quickLookItems) {
        quickLookItem.addEventListener('mouseenter', function (e) {
            quickLookItem.style.width = `${quickLookItem.scrollWidth}px`
        })
        quickLookItem.addEventListener('mouseleave', function (e) {
            quickLookItem.style.width = getCssVariable('--mmn-quick-look-icon-initial-size')
        })
    }
    // setup "scroll to top"
    window.addEventListener('scroll', function (e) {
        if (window.scrollY > SCROLL_Y_BEGIN) {
            scrollToTopBtn.classList.add('active')
        } else {
            scrollToTopBtn.classList.remove('active')
        }
    })
}
initPage()
