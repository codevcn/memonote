'use strict'
const homePage_pageMain = document.querySelector('#page-main')
const realtimeModeDisplay = document.querySelector('#nav-bar .realtime-mode-display')
const noteSettingsBoard = document.querySelector('#note-settings-modal .note-settings-board')
const settingsModal_logoutBtn = noteSettingsBoard.querySelector(
    '.note-settings-navigation .logout-btn',
)
const setPasswordForm = document.getElementById('settings-form-set-password')
const removePasswordForm = document.getElementById('settings-form-remove-password')
const noteQuickLook = homePage_pageMain.querySelector('.note-quick-look .quick-look-items')
const scrollToTopBtn = document.querySelector('#bubble-btns .scroll-to-top-btn')
const scrollToBottomBtn = document.querySelector('#bubble-btns .scroll-to-bottom-btn')
const SCROLL_TO_TOP_THRESHOLD = 100
const SCROLL_TO_BOTTOM_THRESHOLD = 100
const NOTE_BROADCAST_DELAY = 1000
const validateNoteContent = (noteContent) => {
    if (noteContent.length > ENoteLengths.MAX_LENGTH_NOTE_CONTENT) {
        return false
    }
    return true
}
const countNoteLetters = (noteEditorTarget, noteContent) => {
    if (!validateNoteContent(noteContent)) return
    noteEditorTarget
        .closest('.note-editor-section')
        .querySelector('.letters-count .count').innerHTML =
        `${noteContent.length} / ${ENoteLengths.MAX_LENGTH_NOTE_CONTENT}`
}
const catchBackspaceWhenTyping = async (noteEditorTarget, event) => {
    if (event.key === 'Backspace') {
        const noteContent = noteEditorTarget.value
        countNoteLetters(noteEditorTarget, noteContent)
    }
}
const setBoardUIOfNoteEditor = (noteEditorTarget, noteContent) => {
    if (validateNoteContent(noteContent)) {
        // set height of editor
        noteEditorTarget.parentElement.setAttribute('data-replicated-value', noteContent)
    }
}
const broadcastNoteContentTypingHanlder = debounce((noteContent) => {
    NormalEditorController.notifyNoteEdited('off', { content: 'true' })
    NormalEditorController.broadcastNoteTyping({ content: noteContent })
}, NOTE_BROADCAST_DELAY)
const broadcastNoteTitleTypingHanlder = debounce((target) => {
    NormalEditorController.notifyNoteEdited('off', { title: 'true' })
    NormalEditorController.broadcastNoteTyping({ title: target.value })
}, NOTE_BROADCAST_DELAY)
const broadcastNoteAuthorTypingHanlder = debounce((target) => {
    NormalEditorController.notifyNoteEdited('off', { author: 'true' })
    NormalEditorController.broadcastNoteTyping({ author: target.value })
}, NOTE_BROADCAST_DELAY)
const noteTyping = async (noteEditorTarget) => {
    const noteContent = noteEditorTarget.value
    broadcastNoteContentTypingHanlder(noteContent)
    countNoteLetters(noteEditorTarget, noteContent)
    setBoardUIOfNoteEditor(noteEditorTarget, noteContent)
}
const setContentNoteFormEdited = (noteForm) => {
    const { author, content, title } = noteForm
    const noteFormEle = document.getElementById('note-form')
    if (title || title === '') {
        noteFormEle.querySelector('.note-title input').value = title
    }
    if (author || author === '') {
        noteFormEle.querySelector('.note-author input').value = author
    }
    const noteEditor = document.getElementById('note-form')
    if (content || content === '') {
        setNoteEditorContent(content)
        setBoardUIOfNoteEditor(noteEditor, content)
    }
    countNoteLetters(noteEditor, content || '')
}
const setNoteEditorContent = (noteContent) => {
    document.getElementById('note-editor').value = noteContent
}
const addNewContentToNoteEditor = (newContent) => {
    const noteEditor = document.getElementById('note-editor')
    noteEditor.value += newContent
    const noteContent = noteEditor.value
    setBoardUIOfNoteEditor(noteEditor, noteContent)
    broadcastNoteContentTypingHanlder(noteContent)
}
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
const saveSettingsSetPasswordForNote = async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    const password = formData.get('password')
    const logoutAll = formData.get('logout-all')
    if (validatePassword(password)) {
        const submitBtn = form.querySelector('.form-submit-btn')
        submitBtn.classList.add('on-progress')
        const innerHTML_beforeUpdate = submitBtn.innerHTML
        submitBtn.innerHTML = Materials.createHTMLLoading('border')
        let apiSuccess = false
        try {
            await setPasswordForNoteAPI(password, !!logoutAll)
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
}
const saveSettingsRemovePasswordOfNote = async (e) => {
    e.preventDefault()
    const submitBtn = e.target.querySelector('.form-submit-btn')
    const innerHTML_beforeRemove = submitBtn.innerHTML
    submitBtn.innerHTML = Materials.createHTMLLoading('border')
    let apiSuccess = false
    try {
        await removePasswordForNoteAPI()
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
}
const logoutHandler = async (target) => {
    const innerHTML_beforeLogout = target.innerHTML
    target.innerHTML = Materials.createHTMLLoading('border')
    target.classList.add('on-progress')
    let apiSuccess = false
    try {
        await logoutAPI()
        apiSuccess = true
    } catch (error) {
        if (error instanceof Error) {
            const err = HTTPErrorHandler.handleError(error)
            LayoutController.toast('error', err.message)
        }
    }
    if (apiSuccess) {
        refreshPageAfterMs(500)
        LayoutController.setGeneralAppStatus('success')
    }
    target.classList.remove('on-progress')
    target.innerHTML = innerHTML_beforeLogout
}
const setStatusOfSettingsForm = (formTarget, type) => {
    const isSaved = type === 'saved'
    const formStatus = formTarget.querySelector('.form-title .status')
    formStatus.classList.add('active')
    formStatus.querySelector('.form-title .status .status-item.saved').hidden = !isSaved
    formStatus.querySelector('.form-title .status .status-item.unsaved').hidden = isSaved
}
const setRealtimeModeHandler = (status) => {
    if (status && status === 'on') {
        realtimeModeDisplay.classList.replace('inactive', 'active')
        const currentRealtimeMode = LocalStorageController.getRealtimeMode()
        if (!currentRealtimeMode || currentRealtimeMode !== 'sync') {
            NormalEditorController.fetchNoteContent()
        }
    } else {
        realtimeModeDisplay.classList.replace('active', 'inactive')
    }
    LocalStorageController.setRealtimeMode(status ? 'sync' : 'stop')
}
const setNightModeHandler = (status) => {
    const mixer = document.getElementById('night-mode-mixer')
    if (status && status === 'on') {
        LocalStorageController.writeCssVariable('--mmn-mix-night-mode-reversed', 'difference')
        mixer.classList.add('mix')
        LocalStorageController.setNightMode('on')
    } else {
        LocalStorageController.writeCssVariable('--mmn-mix-night-mode-reversed', 'normal')
        mixer.classList.remove('mix')
        LocalStorageController.setNightMode('off')
    }
}
const saveSettingsChangeModes = async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    const realtimeMode = formData.get('realtime-mode')
    const notifyNoteEditedMode = formData.get('notify-note-edited')
    const nightMode = formData.get('night-mode')
    setRealtimeModeHandler(realtimeMode)
    LocalStorageController.setNotifyNoteEditedMode(notifyNoteEditedMode ? 'on' : 'off')
    setNightModeHandler(nightMode)
    setStatusOfSettingsForm(form, 'saved')
}
const changeNoteFormTextFontHandler = (font) => {
    const textFont = convertToCssFontFamily(font)
    LocalStorageController.writeCssVariable('--mmn-note-form-fonf', textFont)
    LocalStorageController.setNoteFormTextFont(font)
}
const changeNavBarPosHandler = (pos) => {
    LocalStorageController.setNavBarPos(pos)
    const navBar = document.getElementById('nav-bar')
    const posClasses = ['pos-sticky', 'pos-static']
    navBar.classList.remove(...posClasses)
    if (pos === 'sticky') {
        navBar.classList.add(posClasses[0])
    } else if (pos === 'static') {
        navBar.classList.add(posClasses[1])
    }
}
const saveSettingsUserInterface = async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    const editedNotifyStyle = formData.get('edited-notify-style')
    const noteFormFont = formData.get('note-form-font')
    const navBarPos = formData.get('nav-bar-pos')
    if (editedNotifyStyle) {
        LocalStorageController.setEditedNotifyStyle(editedNotifyStyle)
    }
    if (noteFormFont) {
        changeNoteFormTextFontHandler(noteFormFont)
    }
    if (navBarPos) {
        changeNavBarPosHandler(navBarPos)
    }
    setStatusOfSettingsForm(form, 'saved')
}
const scrollToTop = () => {
    const threshold = 50
    if (window.scrollY > SCROLL_TO_TOP_THRESHOLD) {
        window.scrollTo({ top: threshold, behavior: 'instant' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}
const scrollToBottom = () => {
    const threshold = 50
    const windowHeight = window.innerHeight
    const heightToScroll = document.body.scrollHeight - windowHeight
    window.scrollTo({
        top: heightToScroll - threshold,
        behavior: 'instant',
    })
    window.scrollTo({
        top: heightToScroll,
        behavior: 'smooth',
    })
}
const onChangLanguageHandler = async (e) => {
    const selectEle = e.target
    const formSubmitBtn = selectEle.closest('.form-group').querySelector('.progress-container')
    const htmlBefore = formSubmitBtn.innerHTML
    formSubmitBtn.innerHTML = Materials.createHTMLLoading('border')
    const lang = selectEle.value
    let apiSuccess = false
    try {
        await requestLangAPI(lang)
        apiSuccess = true
    } catch (error) {
        if (error instanceof Error) {
            const err = HTTPErrorHandler.handleError(error)
            LayoutController.toast('error', err.message)
        }
    }
    if (apiSuccess) {
        window.location.reload()
    }
    formSubmitBtn.innerHTML = htmlBefore
}
const setupScrollToBottom = () => {
    const scrollPosition = window.innerHeight + window.scrollY
    const threshold = document.body.scrollHeight - SCROLL_TO_BOTTOM_THRESHOLD
    if (scrollPosition < threshold) {
        scrollToBottomBtn.classList.add('active')
    } else {
        scrollToBottomBtn.classList.remove('active')
    }
}
const initHomePage = () => {
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
    const realtimeMode = LocalStorageController.getRealtimeMode()
    if (realtimeMode && realtimeMode === 'sync') {
        const realtimeModeInput = document.getElementById('realtime-mode-input')
        realtimeModeInput.checked = true
        realtimeModeDisplay.classList.replace('inactive', 'active')
    }
    const notifyNoteEditedMode = LocalStorageController.getNotifyNoteEditedMode()
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
    const editedNotifyStyle = LocalStorageController.getEditedNotifyStyle()
    if (editedNotifyStyle) {
        const editedNotifyStyleSelect = document.getElementById('edited-notify-style-select')
        const optionExists = Array.from(editedNotifyStyleSelect.options).some(
            (option) => option.value === editedNotifyStyle,
        )
        if (optionExists) {
            editedNotifyStyleSelect.value = editedNotifyStyle
        }
    }
    // setup "note form text font"
    const noteFormTextFont = LocalStorageController.getNoteFormTextFont()
    if (noteFormTextFont) {
        const noteFormTextFontSelect = document.getElementById('note-form-font-select')
        changeNoteFormTextFontHandler(noteFormTextFont)
        const optionExists = Array.from(noteFormTextFontSelect.options).some(
            (option) => option.value === noteFormTextFont,
        )
        if (optionExists) {
            noteFormTextFontSelect.value = noteFormTextFont
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
            quickLookItem.style.width = LocalStorageController.getCssVariable(
                '--mmn-quick-look-icon-initial-size',
            )
        })
    }
    // setup "scroll to"
    window.addEventListener('scroll', async function (e) {
        // scroll to top
        if (window.scrollY > SCROLL_TO_TOP_THRESHOLD) {
            scrollToTopBtn.classList.add('active')
        } else {
            scrollToTopBtn.classList.remove('active')
        }
        // scroll to bottom
        setupScrollToBottom()
    })
    // setup "night mode"
    const nightMode = LocalStorageController.getNightMode()
    if (nightMode && nightMode === 'on') {
        const nightModeInput = document.getElementById('night-mode-input')
        nightModeInput.checked = true
        setNightModeHandler('on')
    }
    // setup nav bar pos
    const navBarPos = LocalStorageController.getNavBarPos()
    if (navBarPos) {
        const navBarPosSelect = document.getElementById('nav-bar-pos-select')
        changeNavBarPosHandler(navBarPos)
        const optionExists = Array.from(navBarPosSelect.options).some(
            (option) => option.value === navBarPos,
        )
        if (optionExists) {
            navBarPosSelect.value = navBarPos
        }
    }
    // user actions
    initUserActions()
}
initHomePage()
