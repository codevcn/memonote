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
const clientSocketConfig = {
    autoConnect: true,
    withCredentials: true,
}
// init socket
const editNoteSocket = io(`/${ENamespacesOfSocket.EDIT_NOTE}`, clientSocketConfig)
// init vars
const editNoteSocketReconnecting = { flag: false }
// listeners
editNoteSocket.on(EInitSocketEvents.CLIENT_CONNECTED, (data) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (editNoteSocketReconnecting.flag) {
            LayoutController.toast('success', 'Connected to server.', 2000)
            editNoteSocketReconnecting.flag = false
        }
        console.log('>>> Socket connected to server.')
    }),
)
editNoteSocket.on(EInitSocketEvents.CONNECT_ERROR, (err) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (editNoteSocket.active) {
            LayoutController.toast('info', 'Trying to connect with the server.', 2000)
            editNoteSocketReconnecting.flag = true
        } else {
            LayoutController.toast('error', "Can't connect with the server.")
            console.error(`>>> connect_error due to ${err.message}`)
        }
    }),
)
editNoteSocket.on(ENoteEvents.NOTE_FORM_EDITED, (data) =>
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
// emitters
const broadcastNoteTyping = (note) =>
    __awaiter(void 0, void 0, void 0, function* () {
        LayoutController.setUIOfGeneralAppStatus('loading')
        editNoteSocket
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
const fetchNoteContent = () =>
    __awaiter(void 0, void 0, void 0, function* () {
        editNoteSocket
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
