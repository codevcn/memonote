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
var ENamespacesOfSocket
;(function (ENamespacesOfSocket) {
    ENamespacesOfSocket['EDIT_NOTE'] = 'edit-note'
})(ENamespacesOfSocket || (ENamespacesOfSocket = {}))
var ENoteEvents
;(function (ENoteEvents) {
    ENoteEvents['CLIENT_CONNECTED'] = 'client_connected'
    ENoteEvents['NOTE_TYPING'] = 'note_typing'
})(ENoteEvents || (ENoteEvents = {}))
// vars
const clientSocketReconnecting = { value: false }
// sockets
const clientSocket = io(`/${ENamespacesOfSocket.EDIT_NOTE}`, {
    autoConnect: true,
    withCredentials: true,
})
clientSocket.on(ENoteEvents.CLIENT_CONNECTED, (data) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (clientSocketReconnecting.value) {
            LayoutUI.toast('success', 'Connected to server.', 2000)
            clientSocketReconnecting.value = false
        }
        console.log('>>> Socket connected to server.')
    }),
)
clientSocket.on('connect_error', (err) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (clientSocket.active) {
            LayoutUI.toast('info', 'Trying to connect with the server.', 2000)
            clientSocketReconnecting.value = true
        } else {
            LayoutUI.toast('error', "Can't connect with the server.")
            console.error(`connect_error due to ${err.message}`)
        }
    }),
)
clientSocket.on(ENoteEvents.NOTE_TYPING, (data) =>
    __awaiter(void 0, void 0, void 0, function* () {
        const realtimeMode = getRealtimeModeInDevice()
        if (realtimeMode && realtimeMode === 'sync') {
            setForNoteFormChanged(data)
        }
    }),
)
const broadcastNoteContentTyping = (content) =>
    __awaiter(void 0, void 0, void 0, function* () {
        clientSocket.emit(ENoteEvents.NOTE_TYPING, { content })
        console.log('>>> content broadcasts >>>', content)
    })
const broadcastNoteTitleTyping = (title) =>
    __awaiter(void 0, void 0, void 0, function* () {
        clientSocket.emit(ENoteEvents.NOTE_TYPING, { title })
        console.log('>>> title broadcasts >>>', title)
    })
const broadcastNoteAuthorTyping = (author) =>
    __awaiter(void 0, void 0, void 0, function* () {
        clientSocket.emit(ENoteEvents.NOTE_TYPING, { author })
        console.log('>>> title broadcasts >>>', author)
    })