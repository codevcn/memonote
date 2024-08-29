'use strict'
// init types, enums, ...
var ENoteEvents
;(function (ENoteEvents) {
    ENoteEvents['NOTE_FORM_EDITED'] = 'note_form_edited'
    ENoteEvents['FETCH_NOTE_FORM'] = 'fetch_note_form'
})(ENoteEvents || (ENoteEvents = {}))
// init socket
const normalEditorSocket = io(`/${ENamespacesOfSocket.NORMAL_EDITOR}`, clientSocketConfig)
// init vars
const normalEditorSocketReconnecting = { flag: false }
// listeners
normalEditorSocket.on(EInitSocketEvents.CLIENT_CONNECTED, async (data) => {
    if (normalEditorSocketReconnecting.flag) {
        LayoutController.toast('success', 'Connected to server.', 2000)
        normalEditorSocketReconnecting.flag = false
    }
    console.log('>>> normal Editor Socket connected to server.')
})
normalEditorSocket.on(EInitSocketEvents.CONNECT_ERROR, async (err) => {
    if (normalEditorSocket.active) {
        LayoutController.toast('info', 'Trying to connect with the server.', 2000)
        normalEditorSocketReconnecting.flag = true
    } else {
        LayoutController.toast('error', "Can't connect with the server.")
        console.error(`>>> normal Editor connect_error due to ${err.message}`)
    }
})
normalEditorSocket.on(ENoteEvents.NOTE_FORM_EDITED, async (data) => {
    const realtimeMode = LocalStorageController.getRealtimeMode()
    if (realtimeMode && realtimeMode === 'sync') {
        setForNoteFormEdited(data)
    } else {
        const notifyNoteEditedMode = LocalStorageController.getNotifyNoteEditedMode()
        if (notifyNoteEditedMode && notifyNoteEditedMode === 'on') {
            LayoutController.notifyNoteEdited('on', data)
        }
    }
})
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
        LayoutController.setUIOfGeneralAppStatus('loading')
        normalEditorSocket
            .timeout(EBroadcastTimeouts.EDIT_NOTE_TIMEOUT)
            .emit(ENoteEvents.NOTE_FORM_EDITED, note, (err, res) => {
                if (err) {
                    LayoutController.setUIOfGeneralAppStatus('error')
                    console.log('>>> broadcast note err >>>', err)
                } else {
                    if (res.success) {
                        LayoutController.setUIOfGeneralAppStatus('success')
                    } else {
                        LayoutController.setUIOfGeneralAppStatus('error')
                    }
                    console.log('>>> broadcast note res >>>', res)
                }
            })
    }
    static async fetchNoteContent() {
        normalEditorSocket
            .timeout(EBroadcastTimeouts.EDIT_NOTE_TIMEOUT)
            .emit(ENoteEvents.FETCH_NOTE_FORM, (err, res) => {
                LayoutController.notifyNoteEdited('off', {
                    title: 'true',
                    author: 'true',
                    content: 'true',
                })
                if (res.success) {
                    setForNoteFormEdited(res.data)
                }
            })
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
