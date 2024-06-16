const pageMain_homePage = document.querySelector('#page-main') as HTMLElement
const userActionsAndLogout = pageMain_homePage.querySelector(
    '.user-actions-and-logout',
) as HTMLElement
const userActions = userActionsAndLogout.querySelector('.user-actions') as HTMLElement
const notesSection = pageMain_homePage.querySelector('.notes') as HTMLElement

type TNoteContentHistory = {
    history: string[]
    index: number
}

const noteContentHistory: TNoteContentHistory = { history: [''], index: 0 }

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
    broadcastNoteContentTyping(noteContent)
}, ENoteTyping.NOTE_BROADCAST_DELAY)

const broadcastNoteTitleTypingHanlder = debounce((target: HTMLInputElement): void => {
    broadcastNoteTitleTyping(target.value)
}, ENoteTyping.NOTE_BROADCAST_DELAY)

const broadcastNoteAuthorTypingHanlder = debounce((target: HTMLInputElement): void => {
    broadcastNoteAuthorTyping(target.value)
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
        .closest('.note-container')!
        .querySelector(
            '.note-editor-board .note-editor-container .note-editor',
        ) as HTMLTextAreaElement
}

const setForNoteFormChanged = (noteForm: TNoteForm) => {
    const { author, content, title } = noteForm
    const noteEditor = document.getElementById('note-editor') as HTMLTextAreaElement
    const noteContainer = noteEditor.closest('.note-container') as HTMLElement
    if (title || title === '') {
        const noteTitle = noteContainer.querySelector('.note-title input') as HTMLInputElement
        noteTitle.value = title
    }
    if (author || author === '') {
        const noteAuthor = noteContainer.querySelector('.note-author input') as HTMLInputElement
        noteAuthor.value = author
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

const setPasswordMessage = (
    message: string,
    messageTarget: HTMLElement,
    type: TPasswordMessage,
): void => {
    let content
    if (type === 'success') {
        messageTarget.classList.remove('warning')
        messageTarget.classList.remove('valid')
        messageTarget.classList.add('success')
        content = `
            <i class="bi bi-check-circle"></i>
            <span>${message}</span>`
    } else if (type === 'warning') {
        messageTarget.classList.add('warning')
        messageTarget.classList.remove('success')
        messageTarget.classList.remove('valid')
        content = `
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>${message}</span>`
    } else {
        messageTarget.classList.remove('warning')
        messageTarget.classList.remove('success')
        messageTarget.classList.add('form-group-is-valid')
        content = ''
    }
    messageTarget.innerHTML = content
}

const validatePassword = (formGroupTarget: HTMLElement, password: string): boolean => {
    let is_valid = true
    const messageTarget = formGroupTarget.querySelector('.message') as HTMLElement
    if (notePasswordRegEx.test(password)) {
        is_valid = true
        setPasswordMessage('', messageTarget, 'valid')
    } else {
        is_valid = false
        setPasswordMessage('Please type your password format correctly!', messageTarget, 'warning')
    }
    return is_valid
}

const setPasswordForNote = async (password: string): Promise<void> => {
    const noteUniqueName = getNoteUniqueNameFromURL()
    if (noteUniqueNameRegEx.test(noteUniqueName)) {
        await setPasswordOfNoteAPI(password, noteUniqueName)
    }
}

const setUIOfRemovePasswordBtn = (isHidden: boolean): void => {
    const removePasswordBtn = userActions.querySelector(
        '.user-action.remove-note-password',
    ) as HTMLButtonElement
    removePasswordBtn.hidden = isHidden
}

type TSetPasswordType = 'add' | 'change'

const setUIAfterUpdatePassword = (type: TSetPasswordType): void => {
    const setPasswordBtn = userActions.querySelector(
        '.user-action.set-note-password',
    ) as HTMLButtonElement

    if (type === 'add') {
        setPasswordBtn.innerHTML = `
            <i class="bi bi-lock-fill"></i>
            <span>Add Password</span>`
        const addPasswordModal = document.getElementById(
            'set-note-password-modal',
        ) as HTMLDivElement
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-header .modal-title',
        )!.innerHTML = 'Add Password For This Note'
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-body .form-group label',
        )!.innerHTML = 'Add Password'
        ;(userActions.querySelector('.remove-note-password') as HTMLElement).hidden = true
    } else {
        setPasswordBtn.innerHTML = `
            <i class="bi bi-arrow-repeat"></i>
            <span>Change Password</span>`
        const addPasswordModal = document.getElementById(
            'set-note-password-modal',
        ) as HTMLDivElement
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-header .modal-title',
        )!.innerHTML = 'Change the password'
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-body .form-group label',
        )!.innerHTML = 'Change password'
    }
}

const setUIOfLogoutBtn = (isHidden: boolean): void => {
    const logoutBtn = userActionsAndLogout.querySelector('.logout-btn') as HTMLButtonElement
    logoutBtn.hidden = isHidden
}

const catchEnterKeyOfSetPassword = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
        const saveChangeBtn = e.target as HTMLInputElement
        setPasswordForNoteHanlder(
            saveChangeBtn
                .closest('.modal-content')!
                .querySelector('.modal-footer .modal-save-change-btn') as HTMLButtonElement,
        )
    }
}

const setPasswordForNoteHanlder = async (target: HTMLButtonElement): Promise<void> => {
    const formGroup = target
        .closest('.modal-content')
        ?.querySelector('.modal-body .form-group') as HTMLElement
    const input = formGroup.querySelector('.input-wrapper input') as HTMLInputElement

    const password = input.value

    if (validatePassword(formGroup, password)) {
        target.classList.add('on-progress')
        target.innerHTML = getHTMLLoading('border')
        const message = formGroup.querySelector('.message') as HTMLElement

        let apiSuccess: boolean = false
        try {
            await setPasswordForNote(password)
            apiSuccess = true
        } catch (error) {
            if (error instanceof Error) {
                const err = APIErrorHandler.handleError(error)
                setPasswordMessage(err.message, message, 'warning')
            }
        }

        if (apiSuccess) {
            setUIOfLogoutBtn(false)
            setUIAfterUpdatePassword('change')
            setUIOfRemovePasswordBtn(false)
            setPasswordMessage('Save password successfully!', message, 'success')
            setTimeout(() => {
                setPasswordMessage('', message, 'valid')
            }, 3000)
        }

        target.classList.remove('on-progress')
        target.innerHTML = `
            <i class="bi bi-check-lg"></i>
            <span>Save Change</span>`
    }
}

const removePasswordOfNote = async (noteUniqueName: string): Promise<void> => {
    if (noteUniqueNameRegEx.test(noteUniqueName)) {
        await removePasswordOfNoteAPI(noteUniqueName)
    }
}

const removePasswordOfNoteHandler = async (target: HTMLElement): Promise<void> => {
    target.innerHTML = getHTMLLoading('border')
    let apiSuccess: boolean = false
    try {
        await removePasswordOfNote(getNoteUniqueNameFromURL())
        apiSuccess = true
    } catch (error) {
        if (error instanceof Error) {
            const err = APIErrorHandler.handleError(error)
            LayoutUI.toast('error', err.message)
        }
    }
    if (apiSuccess) {
        setUIAfterUpdatePassword('add')
        setUIOfLogoutBtn(true)
    }
    target.innerHTML = `
        <i class="bi bi-check-lg"></i>
        <span>Save Change</span>`
}

const logout = async (noteUniqueName: string): Promise<void> => {
    if (noteUniqueNameRegEx.test(noteUniqueName)) {
        await logoutAPI(noteUniqueName)
    }
}

const logoutHandler = async (target: HTMLButtonElement): Promise<void> => {
    target.innerHTML = getHTMLLoading('border')
    target.classList.add('on-progress')
    let apiSuccess: boolean = false
    try {
        await logout(getNoteUniqueNameFromURL())
        apiSuccess = true
    } catch (error) {
        if (error instanceof Error) {
            const err = APIErrorHandler.handleError(error)
            LayoutUI.toast('error', err.message)
        }
    }
    if (apiSuccess) {
        refreshPageAfterMs(500)
        LayoutUI.setUIOfGenetalAppStatus('success')
    }
    target.classList.remove('on-progress')
    target.innerHTML = `
        <span>Logout</span>
        <i class="bi bi-box-arrow-right"></i>`
}

const setStatusOfChangeModesSetting = (formTarget: HTMLFormElement, type: 'unsaved' | 'saved') => {
    const isSaved = type === 'saved'
    const statusItemSaved = formTarget.querySelector(
        '.form-title .status .status-item.saved',
    ) as HTMLSpanElement
    statusItemSaved.hidden = !isSaved
    const statusItemUnsaved = formTarget.querySelector(
        '.form-title .status .status-item.unsaved',
    ) as HTMLSpanElement
    statusItemUnsaved.hidden = isSaved
}

type TFormCheckValues = null | 'on'

const saveChangeSettings = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const realtimeMode = formData.get('realtime-mode') as TFormCheckValues
    if (realtimeMode === 'on') {
        setRealtimeModeInDevice('sync')
    } else if (!realtimeMode) {
        setRealtimeModeInDevice('stop')
    }

    setStatusOfChangeModesSetting(form, 'saved')
}

const initPage = (): void => {
    // setup "change modes" form
    const realtimeMode = getRealtimeModeInDevice()
    if (realtimeMode && realtimeMode === 'sync') {
        const realtimeModeInput = document.getElementById('realtime-mode-input') as HTMLInputElement
        realtimeModeInput.checked = true
    }

    const changeModesForm = document.getElementById('settings-form-change-modes') as HTMLFormElement
    const changeModesFormInputs = changeModesForm.querySelectorAll(
        'input',
    ) as NodeListOf<HTMLInputElement>
    for (const input of changeModesFormInputs) {
        input.addEventListener('change', function (e: Event) {
            setStatusOfChangeModesSetting(changeModesForm, 'unsaved')
        })
    }
}
initPage()
