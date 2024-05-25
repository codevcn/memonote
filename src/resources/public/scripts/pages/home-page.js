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
const pageMain_homePage = document.querySelector('#page-main')
const userActionsAndLogout = pageMain_homePage.querySelector('.user-actions-and-logout')
const userActions = userActionsAndLogout.querySelector('.user-actions')
const notesContainer = pageMain_homePage.querySelector('.notes')
const noteContentHistory = { history: [''], index: 0 }
const max_lenght_of_note_history = 10
const validateNoteContent = (noteContent) => {
    if (noteContent.length > MAX_LENGTH_OF_NOTE_CONTENT) {
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
        if (currentNoteContentHistory.length > max_lenght_of_note_history) {
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
        `${noteContent.length} / ${MAX_LENGTH_OF_NOTE_CONTENT}`
}
const catchBackspaceWhenTyping = (noteEditorTarget, event) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (event.key === 'Backspace') {
            const noteContent = noteEditorTarget.value
            countNoteLetters(noteEditorTarget, noteContent)
        }
    })
const setEditorBoardUI = (noteEditorTarget, noteContent) => {
    if (validateNoteContent(noteContent)) {
        // set height of editor
        noteEditorTarget.nextElementSibling.innerHTML = noteContent
    } else {
        noteEditorTarget.value = noteContentHistory.history[noteContentHistory.history.length - 1]
    }
}
const broadcastNoteChanges = (noteContent) => {
    console.log('>>> broadcast >>>', noteContentHistory)
}
const broadcastNoteChangesHanlder = (noteContent) =>
    __awaiter(void 0, void 0, void 0, function* () {
        debounce(broadcastNoteChanges, 500)(noteContent)
    })
const noteTyping = (noteEditorTarget) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const noteContent = noteEditorTarget.value
        broadcastNoteChangesHanlder(noteContent)
        countNoteLetters(noteEditorTarget, noteContent)
        setNoteContentHistory(noteContent)
        setEditorBoardUI(noteEditorTarget, noteContent)
    })
const selectNoteEditorFromInside = (target) => {
    var _a
    return (_a = target.closest('.note-container')) === null || _a === void 0
        ? void 0
        : _a.querySelector('.note-editor-board .note-editor-container .note-editor')
}
const setNoteContent = (noteEditorTarget, content) => {
    noteEditorTarget.value = content
}
const clearNoteContent = (noteEditorTarget) => {
    setNoteContent(noteEditorTarget, '')
    countNoteLetters(noteEditorTarget, '')
    setEditorBoardUI(noteEditorTarget, '')
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
const redoNoteContent = (noteEditorTarget) => {}
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
                setEditorBoardUI(noteEditor, noteEditor.value)
                return
        }
        const updatedNoteEditorValue = noteEditor.value
        setNoteContentHistory(updatedNoteEditorValue)
        setEditorBoardUI(noteEditor, updatedNoteEditorValue)
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
const setPasswordMessage = (message, messageTarget, type) => {
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
const validatePassword = (formGroupTarget, password) => {
    let is_valid = true
    const messageTarget = formGroupTarget.querySelector('.message')
    if (notePasswordRegEx.test(password)) {
        is_valid = true
        setPasswordMessage('', messageTarget, 'valid')
    } else {
        is_valid = false
        setPasswordMessage('Please type your password format correctly!', messageTarget, 'warning')
    }
    return is_valid
}
const setPasswordForNote = (password) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const noteUniqueName = getNoteUniqueNameFromURL()
        if (noteUniqueNameRegEx.test(noteUniqueName)) {
            yield setPasswordOfNoteAPI(password, noteUniqueName)
        }
    })
const setUIOfRemovePasswordBtn = (isHidden) => {
    const removePasswordBtn = userActions.querySelector('.user-action.remove-note-password')
    removePasswordBtn.hidden = isHidden
}
const setUIOfPasswordButton = (type) => {
    const setPasswordBtn = userActions.querySelector('.user-action.set-note-password')
    if (type === 'add') {
        setPasswordBtn.innerHTML = `
            <i class="bi bi-lock-fill"></i>
            <span>Add Password</span>`
        const addPasswordModal = document.getElementById('set-note-password-modal')
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-header .modal-title',
        ).innerHTML = 'Add Password For This Note'
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-body .form-group label',
        ).innerHTML = 'Add Password'
    } else {
        setPasswordBtn.innerHTML = `
            <i class="bi bi-arrow-repeat"></i>
            <span>Change Password</span>`
        const addPasswordModal = document.getElementById('set-note-password-modal')
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-header .modal-title',
        ).innerHTML = 'Change the password'
        addPasswordModal.querySelector(
            '.modal-dialog .modal-content .modal-body .form-group label',
        ).innerHTML = 'Change password'
    }
}
const setUIOfLogoutBtn = (isHidden) => {
    const logoutBtn = userActionsAndLogout.querySelector('.logout-btn')
    logoutBtn.hidden = isHidden
}
const setPasswordForNoteHanlder = (target) =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a
        const formGroup =
            (_a = target.closest('.modal-content')) === null || _a === void 0
                ? void 0
                : _a.querySelector('.modal-body .form-group')
        const input = formGroup.querySelector('.input-wrapper input')
        const password = input.value
        if (validatePassword(formGroup, password)) {
            target.classList.add('on-progress')
            target.innerHTML = getHTMLLoading('spin')
            const message = formGroup.querySelector('.message')
            let success = false
            try {
                yield setPasswordForNote(password)
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
    })
const removePasswordOfNote = (noteUniqueName) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (noteUniqueNameRegEx.test(noteUniqueName)) {
            yield removePasswordOfNoteAPI(noteUniqueName)
        }
    })
const removePasswordOfNoteHandler = (target) =>
    __awaiter(void 0, void 0, void 0, function* () {
        target.innerHTML = getHTMLLoading('grow')
        let success = false
        try {
            yield removePasswordOfNote(getNoteUniqueNameFromURL())
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
    })
const logout = (noteUniqueName) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (noteUniqueNameRegEx.test(noteUniqueName)) {
            yield logoutAPI(noteUniqueName)
        }
    })
const logoutHandler = (target) =>
    __awaiter(void 0, void 0, void 0, function* () {
        target.innerHTML = getHTMLLoading('spin')
        target.classList.add('on-progress')
        let success = false
        try {
            yield logout(getNoteUniqueNameFromURL())
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
    })
