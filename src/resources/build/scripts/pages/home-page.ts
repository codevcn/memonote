const pageMain_homePage = document.querySelector('#page-main') as HTMLElement
const userActionsAndLogout = pageMain_homePage.querySelector(
    '.user-actions-and-logout',
) as HTMLElement
const userActions = userActionsAndLogout.querySelector('.user-actions') as HTMLElement
const notesContainer = pageMain_homePage.querySelector('.notes') as HTMLElement

type TNoteContentHistory = {
    history: string[]
    index: number
}

const noteContentHistory: TNoteContentHistory = { history: [''], index: 0 }
const max_lenght_of_note_history = 10

const validateNoteContent = (noteContent: string): boolean => {
    if (noteContent.length > MAX_LENGTH_OF_NOTE_CONTENT) {
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
        if (currentNoteContentHistory.length > max_lenght_of_note_history) {
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
        `${noteContent.length} / ${MAX_LENGTH_OF_NOTE_CONTENT}`
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

const setEditorBoardUI = (noteEditorTarget: HTMLTextAreaElement, noteContent: string): void => {
    if (validateNoteContent(noteContent)) {
        // set height of editor
        noteEditorTarget.nextElementSibling!.innerHTML = noteContent
    } else {
        noteEditorTarget.value = noteContentHistory.history[noteContentHistory.history.length - 1]
    }
}

const broadcastNoteChanges = (noteContent: string) => {
    console.log('>>> broadcast >>>', noteContentHistory)
}

const broadcastNoteChangesHanlder = async (noteContent: string): Promise<void> => {
    debounce(broadcastNoteChanges, 500)(noteContent)
}

const noteTyping = async (noteEditorTarget: HTMLTextAreaElement): Promise<void> => {
    const noteContent = noteEditorTarget.value
    broadcastNoteChangesHanlder(noteContent)
    countNoteLetters(noteEditorTarget, noteContent)
    setNoteContentHistory(noteContent)
    setEditorBoardUI(noteEditorTarget, noteContent)
}

const selectNoteEditorFromInside = (target: HTMLElement): HTMLTextAreaElement => {
    return target
        .closest('.note-container')
        ?.querySelector(
            '.note-editor-board .note-editor-container .note-editor',
        ) as HTMLTextAreaElement
}

const setNoteContent = (noteEditorTarget: HTMLTextAreaElement, content: string): void => {
    noteEditorTarget.value = content
}

const clearNoteContent = (noteEditorTarget: HTMLTextAreaElement): void => {
    setNoteContent(noteEditorTarget, '')
    countNoteLetters(noteEditorTarget, '')
    setEditorBoardUI(noteEditorTarget, '')
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

const redoNoteContent = (noteEditorTarget: HTMLTextAreaElement): void => {}

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
            setEditorBoardUI(noteEditor, noteEditor.value)
            return
    }
    const updatedNoteEditorValue = noteEditor.value
    setNoteContentHistory(updatedNoteEditorValue)
    setEditorBoardUI(noteEditor, updatedNoteEditorValue)
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

const setUIOfPasswordButton = (type: TSetPasswordType): void => {
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

const setPasswordForNoteHanlder = async (target: HTMLElement): Promise<void> => {
    const formGroup = target
        .closest('.modal-content')
        ?.querySelector('.modal-body .form-group') as HTMLElement
    const input = formGroup.querySelector('.input-wrapper input') as HTMLInputElement

    const password = input.value

    if (validatePassword(formGroup, password)) {
        target.classList.add('on-progress')
        target.innerHTML = getHTMLLoading('spin')
        const message = formGroup.querySelector('.message') as HTMLElement

        let success: boolean = false
        try {
            await setPasswordForNote(password)
            success = true
        } catch (error) {
            if (error instanceof Error) {
                const err = APIErrorHandler.handleError(error)
                setPasswordMessage(err.message, message, 'warning')
            }
        }

        if (success) {
            setUIOfLogoutBtn(false)
            setUIOfPasswordButton('change')
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

const removePasswordOfNoteHandler = async (target: HTMLButtonElement): Promise<void> => {
    target.innerHTML = getHTMLLoading('grow')
    let success: boolean = false
    try {
        await removePasswordOfNote(getNoteUniqueNameFromURL())
        success = true
        target.hidden = true
    } catch (error) {}
    if (success) {
        setUIOfPasswordButton('add')
        setUIOfLogoutBtn(true)
    }
    target.innerHTML = `
        <i class="bi bi-trash3"></i>
        <span>Remove Password</span>`
}

const logout = async (noteUniqueName: string): Promise<void> => {
    if (noteUniqueNameRegEx.test(noteUniqueName)) {
        await logoutAPI(noteUniqueName)
    }
}

const logoutHandler = async (target: HTMLButtonElement): Promise<void> => {
    target.innerHTML = getHTMLLoading('spin')
    target.classList.add('on-progress')
    let success: boolean = false
    try {
        await logout(getNoteUniqueNameFromURL())
        success = true
    } catch (error) {
        console.error('>>> err >>>', error)
    }
    if (success) {
        setTimeout(() => {
            window.location.reload()
        }, 500)
    }
    target.innerHTML = `
        <span>Logout</span>
        <i class="bi bi-box-arrow-right"></i>`
}
