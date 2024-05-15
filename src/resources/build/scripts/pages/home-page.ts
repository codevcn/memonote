const pageMain = document.querySelector('#page-main') as HTMLElement
const notesContainer = pageMain.querySelector('.notes') as HTMLElement
const noteEditors = notesContainer.querySelectorAll<HTMLTextAreaElement>(
    '.note-container .note-editor-board .note-editor-container .note-editor-wrapper .note-editor',
)

const noteContentHistory: string[] = []

const max_height_of_note_editor = 500
const max_lenght_of_note_history = 10

const setNoteContentHistory = (noteContent: string) => {
    if (noteContentHistory.length <= max_lenght_of_note_history) {
        noteContentHistory.push(noteContent)
    }
}

const countNoteLetters = (
    noteEditorTarget: HTMLTextAreaElement,
    noteContentLength: number,
): void => {
    if (noteContentLength > MAX_LENGTH_OF_NOTE_CONTENT) return

    noteEditorTarget
        .closest('.note-editor-container')!
        .querySelector('.letters-count .count')!.innerHTML =
        `${noteContentLength} / ${MAX_LENGTH_OF_NOTE_CONTENT}`
}

const catchBackspaceWhenTyping = async (
    noteEditorTarget: HTMLTextAreaElement,
    event: KeyboardEvent,
): Promise<void> => {
    if (event.key === 'Backspace') {
        const noteContent = noteEditorTarget.value
        countNoteLetters(noteEditorTarget, noteContent.length)
    }
}

const setTypingEditorUI = (noteEditorTarget: HTMLTextAreaElement, noteContent: string): void => {
    // set height of editor
    noteEditorTarget.nextElementSibling!.innerHTML = noteContent
}

const noteTyping = async (noteEditorTarget: HTMLTextAreaElement): Promise<void> => {
    const noteContent = noteEditorTarget.value
    setTypingEditorUI(noteEditorTarget, noteContent)
    if (noteContent) {
        countNoteLetters(noteEditorTarget, noteContent.length)
        setNoteContentHistory(noteContent)
    }
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
    countNoteLetters(noteEditorTarget, 0)
    setTypingEditorUI(noteEditorTarget, '')
}

const copyAllNoteContent = (noteEditorTarget: HTMLTextAreaElement): void => {
    navigator.clipboard.writeText(noteEditorTarget.value)
}

const pasteFromClipboard = async (noteEditorTarget: HTMLTextAreaElement): Promise<void> => {
    const text = await navigator.clipboard.readText()
    noteEditorTarget.value = text
}

const undoNoteContent = (noteEditorTarget: HTMLTextAreaElement): void => {
    if (noteContentHistory.length > 0) {
        noteContentHistory.pop()
        noteEditorTarget.value = noteContentHistory[noteContentHistory.length - 1] || ''
    }
}

type TUsefulActions =
    | 'clipboardPaste'
    | 'copyAllNoteContent'
    | 'clearNoteContent'
    | 'undoNoteContent'

const performUsefulActions = async (target: HTMLElement, type: TUsefulActions): Promise<void> => {
    const noteEditor = selectNoteEditorFromInside(target)
    switch (type) {
        case 'clipboardPaste':
            await pasteFromClipboard(noteEditor)
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
}
