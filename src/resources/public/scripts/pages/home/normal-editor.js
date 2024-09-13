'use strict'
var ENoteEvents
;(function (ENoteEvents) {
    ENoteEvents['NOTE_FORM_EDITED'] = 'note_form_edited'
    ENoteEvents['FETCH_NOTE_FORM'] = 'fetch_note_form'
    ENoteEvents['TRANSCRIBE_AUDIO'] = 'transcript_auido'
    ENoteEvents['TRANSCRIBE_AUDIO_STATE'] = 'transcribe_audio_state'
})(ENoteEvents || (ENoteEvents = {}))
class NormalEditorSocket {
    constructor() {
        this.socket = io(
            `/${ENamespacesOfSocket.NOTE}`,
            initClientSocketConfig(getNoteUniqueNameFromURL(), pageData.noteId),
        )
        this.reconnecting = { flag: false }
        this.listenConnected()
        this.listenConnectionError()
        this.listenNoteFormEdited()
    }
    async listenConnected() {
        this.socket.on(EInitSocketEvents.CLIENT_CONNECTED, (data) => {
            if (this.reconnecting.flag) {
                LayoutController.toast('success', 'Connected to server.', 2000)
                this.reconnecting.flag = false
            }
            console.log('>>> normal Editor Socket connected to server.')
        })
    }
    async listenConnectionError() {
        this.socket.on(EInitSocketEvents.CONNECT_ERROR, (err) => {
            if (this.socket.active) {
                LayoutController.toast('info', 'Trying to connect with the server.', 2000)
                this.reconnecting.flag = true
            } else {
                LayoutController.toast('error', "Can't connect with the server.")
                console.error(`>>> Normal Editor connect_error due to >>> ${err.message}`)
            }
        })
    }
    async listenNoteFormEdited() {
        this.socket.on(ENoteEvents.NOTE_FORM_EDITED, (data) => {
            const realtimeMode = LocalStorageController.getRealtimeMode()
            if (realtimeMode && realtimeMode === 'sync') {
                setForNoteFormEdited(data)
            } else {
                const notifyNoteEditedMode = LocalStorageController.getNotifyNoteEditedMode()
                if (notifyNoteEditedMode && notifyNoteEditedMode === 'on') {
                    NormalEditorController.notifyNoteEdited('on', data)
                }
            }
        })
    }
    async listenTranscribeAudioState() {
        this.socket.on(ENoteEvents.TRANSCRIBE_AUDIO_STATE, (data) => {
            const { state } = data
            if (state === 'transcribing') {
                TranscriptAudioController.setTranscribeLoading(true)
            }
        })
    }
    emitWithoutTimeout(event, payload, cb) {
        this.socket.emit(event, payload, cb)
    }
    emitWithTimeout(event, payload, cb, timeout) {
        this.socket.timeout(timeout).emit(event, payload, cb)
    }
    getSocketId() {
        return this.socket.id
    }
}
const normalEditorSocket = new NormalEditorSocket()
class NormalEditorController {
    // static broadcastNoteContentTypingHanlder(noteContent: string): void {
    //     LayoutController.notifyNoteEdited('off', { content: 'true' })
    //     broadcastNoteTyping({ content: noteContent })
    // }
    // static broadcastNoteTitleTypingHanlder(target: HTMLInputElement): void {
    //     LayoutController.notifyNoteEdited('off', { title: 'true' })
    //     broadcastNoteTyping({ title: target.value })
    // }
    // static broadcastNoteAuthorTypingHanlder(target: HTMLInputElement): void {
    //     LayoutController.notifyNoteEdited('off', { author: 'true' })
    //     broadcastNoteTyping({ author: target.value })
    // }
    static async broadcastNoteTyping(note) {
        LayoutController.setGeneralAppStatus('loading')
        normalEditorSocket.emitWithTimeout(
            ENoteEvents.NOTE_FORM_EDITED,
            note,
            (err, res) => {
                if (err) {
                    LayoutController.setGeneralAppStatus('error')
                    console.log('>>> broadcast note err >>>', err)
                } else {
                    if (res.success) {
                        LayoutController.setGeneralAppStatus('success')
                    } else {
                        LayoutController.setGeneralAppStatus('error')
                    }
                    console.log('>>> broadcast note res >>>', res)
                }
            },
            EBroadcastTimeouts.EDIT_NOTE_TIMEOUT,
        )
    }
    static notifyNoteEdited(type, noteForm) {
        let baseClasses = ['notify-note-edited', 'slither', 'blink']
        let notifyNoteEditedClass = ['notify-note-edited']
        notifyNoteEditedClass.push(LocalStorageController.getEditedNotifyStyle() || 'blink')
        let noteFormItem
        const { title, author, content } = noteForm
        const noteFormEle = homePage_pageMain.querySelector('.note-form')
        if (title || title === '') {
            noteFormItem = noteFormEle.querySelector('.note-title')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (author || author === '') {
            noteFormItem = noteFormEle.querySelector('.note-author')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (content || content === '') {
            noteFormItem = noteFormEle.querySelector('.note-editor-board')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
    }
    static async fetchNoteContent() {
        normalEditorSocket.emitWithTimeout(
            ENoteEvents.FETCH_NOTE_FORM,
            {},
            (err, res) => {
                NormalEditorController.notifyNoteEdited('off', {
                    title: 'true',
                    author: 'true',
                    content: 'true',
                })
                if (res.success) {
                    setForNoteFormEdited(res.data)
                }
            },
            EBroadcastTimeouts.EDIT_NOTE_TIMEOUT,
        )
    }
}
// NormalEditorController.broadcastNoteContentTypingHanlder = debounce(
//     NormalEditorController.broadcastNoteContentTypingHanlder,
//     ENoteTyping.NOTE_BROADCAST_DELAY,
// )
// NormalEditorController.broadcastNoteTitleTypingHanlder = debounce(
//     NormalEditorController.broadcastNoteTitleTypingHanlder,
//     ENoteTyping.NOTE_BROADCAST_DELAY,
// )
// NormalEditorController.broadcastNoteAuthorTypingHanlder = debounce(
//     NormalEditorController.broadcastNoteAuthorTypingHanlder,
//     ENoteTyping.NOTE_BROADCAST_DELAY,
// )
