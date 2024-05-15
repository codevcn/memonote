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
const pageMain = document.querySelector('#page-main')
const notesContainer = pageMain.querySelector('.notes')
const noteEditors = notesContainer.querySelectorAll(
    '.note-container .note-editor-board .note-editor-container .note-editor-wrapper .note-editor',
)
const noteContentHistory = []
const max_height_of_note_editor = 500
const max_lenght_of_note_history = 10
const setNoteContentHistory = (noteContent) => {
    if (noteContentHistory.length <= max_lenght_of_note_history) {
        noteContentHistory.push(noteContent)
    }
}
const countNoteLetters = (noteEditorTarget, noteContentLength) => {
    if (noteContentLength > MAX_LENGTH_OF_NOTE_CONTENT) return
    noteEditorTarget
        .closest('.note-editor-container')
        .querySelector('.letters-count .count').innerHTML =
        `${noteContentLength} / ${MAX_LENGTH_OF_NOTE_CONTENT}`
}
const catchBackspaceWhenTyping = (noteEditorTarget, event) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (event.key === 'Backspace') {
            const noteContent = noteEditorTarget.value
            countNoteLetters(noteEditorTarget, noteContent.length)
        }
    })
const setTypingEditorUI = (noteEditorTarget, noteContent) => {
    // set height of editor
    noteEditorTarget.nextElementSibling.innerHTML = noteContent
}
const noteTyping = (noteEditorTarget) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const noteContent = noteEditorTarget.value
        setTypingEditorUI(noteEditorTarget, noteContent)
        if (noteContent) {
            countNoteLetters(noteEditorTarget, noteContent.length)
            setNoteContentHistory(noteContent)
        }
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
    countNoteLetters(noteEditorTarget, 0)
    setTypingEditorUI(noteEditorTarget, '')
}
const copyAllNoteContent = (noteEditorTarget) => {
    navigator.clipboard.writeText(noteEditorTarget.value)
}
const pasteFromClipboard = (noteEditorTarget) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const text = yield navigator.clipboard.readText()
        noteEditorTarget.value = text
    })
const undoNoteContent = (noteEditorTarget) => {
    if (noteContentHistory.length > 0) {
        noteContentHistory.pop()
        noteEditorTarget.value = noteContentHistory[noteContentHistory.length - 1] || ''
    }
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
                break
            case 'clearNoteContent':
                clearNoteContent(noteEditor)
                break
            case 'undoNoteContent':
                undoNoteContent(noteEditor)
                break
        }
        const updatedNoteEditorValue = noteEditor.value
        const noteContentHistoryLength = noteContentHistory.length
        if (
            noteContentHistoryLength === 0 ||
            updatedNoteEditorValue !== noteContentHistory[noteContentHistoryLength - 1]
        ) {
            setNoteContentHistory(updatedNoteEditorValue)
            countNoteLetters(noteEditor, updatedNoteEditorValue.length)
        }
    })
