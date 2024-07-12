const homePage_pageMain = document.querySelector('#page-main') as HTMLElement
const notesSection = homePage_pageMain.querySelector('.notes') as HTMLElement
const realtimeModeDisplay = document.querySelector('#nav-bar .realtime-mode-display') as HTMLElement
const noteSettingsBoard = document.querySelector(
    '#note-settings-modal .note-settings-board',
) as HTMLElement
const settingsModal_logoutBtn = noteSettingsBoard.querySelector(
    '.note-settings-navigation .logout-btn',
) as HTMLAnchorElement
const setPasswordForm = document.getElementById('settings-form-set-password') as HTMLFormElement
const removePasswordForm = document.getElementById(
    'settings-form-remove-password',
) as HTMLFormElement
const noteQuickLook = homePage_pageMain.querySelector(
    '.note-quick-look .quick-look-items',
) as HTMLElement
const noteFormEle = notesSection.querySelector('.note-form') as HTMLElement
const scrollToTopBtn = document.querySelector('#scroll-to-top') as HTMLElement

type TNoteContentHistory = {
    history: string[]
    index: number
}

const noteContentHistory: TNoteContentHistory = { history: [''], index: 0 }
const SCROLL_Y_BEGIN: number = 200

const validateNoteContent = (noteContent: string): boolean => {
    if (noteContent.length > ENoteLengths.MAX_LENGTH_NOTE_CONTENT) {
        return false
    }
    return true
}

const setNoteContentHistory = (noteContent: string) => {
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

const countNoteLetters = (noteEditorTarget: HTMLTextAreaElement, noteContent: string): void => {
    if (!validateNoteContent(noteContent)) return
    noteEditorTarget
        .closest('.note-editor-container')!
        .querySelector('.letters-count .count')!.innerHTML =
        `${noteContent.length} / ${ENoteLengths.MAX_LENGTH_NOTE_CONTENT}`
}

const catchBackspaceWhenTyping = async (
    noteEditorTarget: HTMLTextAreaElement,
    event: KeyboardEvent,
): Promise<void> => {
    if (event.key === 'Backspace') {
        const noteContent = noteEditorTarget.value
        countNoteLetters(noteEditorTarget, noteContent)
    }
}

const setBoardUIOfNoteEditor = (
    noteEditorTarget: HTMLTextAreaElement,
    noteContent: string,
): void => {
    if (validateNoteContent(noteContent)) {
        // set height of editor
        noteEditorTarget.parentElement!.setAttribute('data-replicated-value', noteContent)
    } else {
        noteEditorTarget.value = noteContentHistory.history[noteContentHistory.history.length - 1]
    }
}

const broadcastNoteContentTypingHanlder = debounce((noteContent: string): void => {
    LayoutController.notifyNoteEdited('off', { content: 'true' })
    broadcastNoteTyping({ content: noteContent })
}, ENoteTyping.NOTE_BROADCAST_DELAY)

const broadcastNoteTitleTypingHanlder = debounce((target: HTMLInputElement): void => {
    LayoutController.notifyNoteEdited('off', { title: 'true' })
    broadcastNoteTyping({ title: target.value })
}, ENoteTyping.NOTE_BROADCAST_DELAY)

const broadcastNoteAuthorTypingHanlder = debounce((target: HTMLInputElement): void => {
    LayoutController.notifyNoteEdited('off', { author: 'true' })
    broadcastNoteTyping({ author: target.value })
}, ENoteTyping.NOTE_BROADCAST_DELAY)

const noteTyping = async (noteEditorTarget: HTMLTextAreaElement): Promise<void> => {
    const noteContent = noteEditorTarget.value
    broadcastNoteContentTypingHanlder(noteContent)
    countNoteLetters(noteEditorTarget, noteContent)
    setNoteContentHistory(noteContent)
    setBoardUIOfNoteEditor(noteEditorTarget, noteContent)
}

const selectNoteEditorFromInside = (target: HTMLElement): HTMLTextAreaElement => {
    return target
        .closest('.note-form')!
        .querySelector(
            '.note-editor-board .note-editor-container .note-editor',
        ) as HTMLTextAreaElement
}

const setForNoteFormChanged = (noteForm: TNoteForm) => {
    const { author, content, title } = noteForm
    const noteEditor = document.getElementById('note-editor') as HTMLTextAreaElement
    const noteContainer = noteEditor.closest('.note-form') as HTMLElement
    if (title || title === '') {
        ;(noteContainer.querySelector('.note-title input') as HTMLInputElement).value = title
    }
    if (author || author === '') {
        ;(noteContainer.querySelector('.note-author input') as HTMLInputElement).value = author
    }
    if (content || content === '') {
        setNoteEditor(noteEditor, content)
        setBoardUIOfNoteEditor(noteEditor, content)
    }
    countNoteLetters(noteEditor, content || '')
}

const setNoteEditor = (noteEditorTarget: HTMLTextAreaElement, noteContent: string): void => {
    noteEditorTarget.value = noteContent
}

const clearNoteContent = (noteEditorTarget: HTMLTextAreaElement): void => {
    setNoteEditor(noteEditorTarget, '')
    countNoteLetters(noteEditorTarget, '')
    setBoardUIOfNoteEditor(noteEditorTarget, '')
}

const copyAllNoteContent = (noteEditorTarget: HTMLTextAreaElement): void => {
    navigator.clipboard.writeText(noteEditorTarget.value)
}

const pasteFromClipboard = async (noteEditorTarget: HTMLTextAreaElement): Promise<void> => {
    const text = await navigator.clipboard.readText()
    if (!validateNoteContent(text)) return
    noteEditorTarget.value = text
}

const undoNoteContent = (noteEditorTarget: HTMLTextAreaElement): void => {
    let historyIndex = noteContentHistory.index
    if (historyIndex > 0) {
        historyIndex--
        noteEditorTarget.value = noteContentHistory.history[historyIndex]
    }
    noteContentHistory.index = historyIndex
}

type TUsefulActions =
    | 'clipboardPaste'
    | 'copyAllNoteContent'
    | 'clearNoteContent'
    | 'undoNoteContent'
    | 'redoNoteContent'

const performUsefulActions = async (target: HTMLElement, type: TUsefulActions): Promise<void> => {
    const noteEditor = selectNoteEditorFromInside(target)
    switch (type) {
        case 'clipboardPaste':
            await pasteFromClipboard(noteEditor)
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
}

const hideShowPassword_homePage = (target: HTMLElement, isShown: boolean): void => {
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

type TPasswordMessage = 'success' | 'warning' | 'valid'

const setMessageOfSetPassword = (message: string, type: TPasswordMessage): void => {
    let content
    const messageTarget = setPasswordForm.querySelector(
        '.form-content .form-group .message',
    ) as HTMLFormElement
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

const validatePassword = (password: string): boolean => {
    let is_valid = true
    if (!NOTE_PASSWORD_REGEX.test(password)) {
        is_valid = false
        setMessageOfSetPassword('Please type your password format correctly!', 'warning')
    }
    return is_valid
}

const setPasswordForNote = async (password: string, logoutAll: boolean): Promise<void> => {
    const noteUniqueName = getNoteUniqueNameFromURL()
    if (NOTE_UNIQUE_NAME_REGEX.test(noteUniqueName)) {
        await setPasswordForNoteAPI(password, logoutAll, noteUniqueName)
    }
}

type TSetPasswordType = 'add' | 'change'

const setUIOfSetPasswordForm = (type: TSetPasswordType): void => {
    let setPasswordLabel: string
    let showRemovePasswordForm: boolean

    if (type === 'add') {
        setPasswordLabel = 'Add Password'
        showRemovePasswordForm = false
    } else {
        setPasswordLabel = 'Change password'
        showRemovePasswordForm = true
    }

    setPasswordForm.querySelector('.form-content .form-group label')!.innerHTML = setPasswordLabel
    ;(removePasswordForm.querySelector('.form-content-container') as HTMLElement).hidden =
        !showRemovePasswordForm
}

const setUIOfRemovePasswordForm = (show: boolean) => {
    ;(removePasswordForm.querySelector('.form-content-container') as HTMLElement).hidden = !show
    ;(removePasswordForm.querySelector('.unset-password-notice') as HTMLElement).hidden = show
}

const setUIOfLogoutBtn = (show: boolean): void => {
    settingsModal_logoutBtn.hidden = !show
}

const setUIOfNoteQuickLook = (itemsShown: string[] = [], itemsHidden: string[] = []) => {
    if (itemsShown.length > 0) {
        for (const itemShown of itemsShown) {
            ;(noteQuickLook.querySelector(`.quick-look-item.${itemShown}`) as HTMLElement).hidden =
                false
        }
    }
    if (itemsHidden.length > 0) {
        for (const itemHidden of itemsHidden) {
            ;(noteQuickLook.querySelector(`.quick-look-item.${itemHidden}`) as HTMLElement).hidden =
                true
        }
    }
}

const saveSettingsSetPasswordForNote = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault()

    const form = e.target as HTMLFormElement

    const formData = new FormData(form)
    const password = formData.get('password') as string
    const logoutAll = formData.get('logout-all') as TFormCheckValues

    if (validatePassword(password)) {
        const submitBtn = form.querySelector('.form-btn') as HTMLButtonElement
        submitBtn.classList.add('on-progress')
        const innerHTML_beforeUpdate = submitBtn.innerHTML
        submitBtn.innerHTML = Materials.createHTMLLoading('border')

        let apiSuccess: boolean = false
        try {
            await setPasswordForNote(password, !!logoutAll)
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

const removePasswordOfNote = async (noteUniqueName: string): Promise<void> => {
    if (NOTE_UNIQUE_NAME_REGEX.test(noteUniqueName)) {
        await removePasswordForNoteAPI(noteUniqueName)
    }
}

const saveSettingsRemovePasswordOfNote = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault()

    const submitBtn = (e.target as HTMLFormElement).querySelector('.form-btn') as HTMLButtonElement
    const innerHTML_beforeRemove = submitBtn.innerHTML
    submitBtn.innerHTML = Materials.createHTMLLoading('border')
    let apiSuccess: boolean = false
    try {
        await removePasswordOfNote(getNoteUniqueNameFromURL())
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

const logout = async (noteUniqueName: string): Promise<void> => {
    if (NOTE_UNIQUE_NAME_REGEX.test(noteUniqueName)) {
        await logoutAPI(noteUniqueName)
    }
}

const logoutHandler = async (target: HTMLButtonElement): Promise<void> => {
    const innerHTML_beforeLogout = target.innerHTML
    target.innerHTML = Materials.createHTMLLoading('border')
    target.classList.add('on-progress')
    let apiSuccess: boolean = false
    try {
        await logout(getNoteUniqueNameFromURL())
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
}

const setStatusOfSettingsForm = (formTarget: HTMLFormElement, type: 'unsaved' | 'saved') => {
    const isSaved = type === 'saved'
    ;(formTarget.querySelector('.form-title .status .status-item.saved') as HTMLElement).hidden =
        !isSaved
    ;(formTarget.querySelector('.form-title .status .status-item.unsaved') as HTMLElement).hidden =
        isSaved
}

const setRealtimeModeHandler = (type: TRealtimeModeTypes): void => {
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

const saveSettingsChangeModes = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const realtimeMode = formData.get('realtime-mode') as TFormCheckValues
    const notifyNoteEditedMode = formData.get('notify-note-edited') as TFormCheckValues

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
}

type TNavigateFormTypes = 'change-modes' | 'password'

type TPasswordTabTypes = 'set-password' | 'remove-password'

const saveSettingsUserInterface = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const editedNotifyStyle = formData.get('edited-notify-style') as TEditedNotifyStyleTypes
    if (editedNotifyStyle) {
        setEditedNotifyStyleInDevice(editedNotifyStyle)
    }

    setStatusOfSettingsForm(form, 'saved')
}

const scrollToTop = () => {
    if (window.scrollY > SCROLL_Y_BEGIN) {
        window.scrollTo({ top: 100, behavior: 'instant' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const initPage = (): void => {
    // setup "navigate" settings
    const navTabs = noteSettingsBoard.querySelectorAll<HTMLElement>(
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
        const realtimeModeInput = document.getElementById('realtime-mode-input') as HTMLInputElement
        realtimeModeInput.checked = true
        realtimeModeDisplay.classList.replace('inactive', 'active')
    }
    const notifyNoteEditedMode = getNotifyNoteEditedModeInDevice()
    if (notifyNoteEditedMode && notifyNoteEditedMode === 'off') {
        const realtimeModeInput = document.getElementById(
            'notify-note-edited-input',
        ) as HTMLInputElement
        realtimeModeInput.checked = false
    }
    const changeModesForm = document.getElementById('settings-form-change-modes') as HTMLFormElement
    const changeModesFormInputs = changeModesForm.querySelectorAll<HTMLInputElement>('.form-field')
    for (const input of changeModesFormInputs) {
        input.addEventListener('change', function (e) {
            setStatusOfSettingsForm(changeModesForm, 'unsaved')
        })
    }

    // setup "password" form
    const passwordForm = document.getElementById('settings-form-set-password') as HTMLFormElement
    const passwordFormInputs = passwordForm.querySelectorAll<HTMLInputElement>('.form-field')
    for (const input of passwordFormInputs) {
        input.addEventListener('input', function (e) {
            setStatusOfSettingsForm(passwordForm, 'unsaved')
        })
    }
    const passwordFormTabs = noteSettingsBoard.querySelectorAll<HTMLButtonElement>(
        '.forms.password .nav-tabs-list .nav-tab',
    )
    for (const passwordFormTab of passwordFormTabs) {
        passwordFormTab.addEventListener('click', function (e) {
            LayoutController.tabNavigator(passwordFormTab)
        })
    }

    // setup "user interface" form
    const editedNotifyStyle = getEditedNotifyStyleInDevice()
    const editedNotifyStyleSelect = document.getElementById(
        'edited-notify-style-select',
    ) as HTMLSelectElement
    if (editedNotifyStyle) {
        const optionExists = Array.from(editedNotifyStyleSelect.options).some(
            (option) => option.value === editedNotifyStyle,
        )
        if (optionExists) {
            editedNotifyStyleSelect.value = editedNotifyStyle
        }
    }
    const userInterfaceForm = document.getElementById(
        'settings-form-user-interface',
    ) as HTMLFormElement
    const userInterfaceFormSelects =
        userInterfaceForm.querySelectorAll<HTMLSelectElement>('.form-field')
    for (const userInterfaceFormInput of userInterfaceFormSelects) {
        userInterfaceFormInput.addEventListener('change', function (e) {
            setStatusOfSettingsForm(userInterfaceForm, 'unsaved')
        })
    }

    // setup "quick look" section
    const quickLookItems = noteQuickLook.querySelectorAll<HTMLElement>('.quick-look-item')
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
