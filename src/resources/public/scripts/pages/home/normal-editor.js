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
// init types, enums, ...
var ENoteEvents
;(function (ENoteEvents) {
    ENoteEvents['NOTE_FORM_EDITED'] = 'note_form_edited'
    ENoteEvents['FETCH_NOTE_FORM'] = 'fetch_note_form'
})(ENoteEvents || (ENoteEvents = {}))
// init socket
const normalEditorSocket = io(`/${ENamespacesOfSocket.NORMAL_EDITOR}`, clientSocketConfig)
// init vars
const editNoteSocketReconnecting = { flag: false }
// listeners
normalEditorSocket.on(EInitSocketEvents.CLIENT_CONNECTED, (data) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (editNoteSocketReconnecting.flag) {
            LayoutController.toast('success', 'Connected to server.', 2000)
            editNoteSocketReconnecting.flag = false
        }
        console.log('>>> Socket connected to server.')
    }),
)
normalEditorSocket.on(EInitSocketEvents.CONNECT_ERROR, (err) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (normalEditorSocket.active) {
            LayoutController.toast('info', 'Trying to connect with the server.', 2000)
            editNoteSocketReconnecting.flag = true
        } else {
            LayoutController.toast('error', "Can't connect with the server.")
            console.error(`>>> connect_error due to ${err.message}`)
        }
    }),
)
normalEditorSocket.on(ENoteEvents.NOTE_FORM_EDITED, (data) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const realtimeMode = getRealtimeModeInDevice()
        if (realtimeMode && realtimeMode === 'sync') {
            setForNoteFormEdited(data)
        } else {
            const notifyNoteEditedMode = getNotifyNoteEditedModeInDevice()
            if (notifyNoteEditedMode && notifyNoteEditedMode === 'on') {
                LayoutController.notifyNoteEdited('on', data)
            }
        }
    }),
)
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
    static broadcastNoteTyping(note) {
        return __awaiter(this, void 0, void 0, function* () {
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
        })
    }
    static fetchNoteContent() {
        return __awaiter(this, void 0, void 0, function* () {
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
