// init types, enums, ...
enum ENoteEvents {
    NOTE_FORM_EDITED = 'note_form_edited',
    FETCH_NOTE_FORM = 'fetch_note_form',
}

type TBroadcastNoteTypingRes = {
    data: TNoteForm
    success: boolean
}

// init socket
const normalEditorSocket = io(`/${ENamespacesOfSocket.NORMAL_EDITOR}`, clientSocketConfig)

// init vars
const editNoteSocketReconnecting: TSocketReconnecting = { flag: false }

// listeners
normalEditorSocket.on(
    EInitSocketEvents.CLIENT_CONNECTED,
    async (data: TClientConnectedEventPld) => {
        if (editNoteSocketReconnecting.flag) {
            LayoutController.toast('success', 'Connected to server.', 2000)
            editNoteSocketReconnecting.flag = false
        }
        console.log('>>> Socket connected to server.')
    },
)

normalEditorSocket.on(EInitSocketEvents.CONNECT_ERROR, async (err: Error) => {
    if (normalEditorSocket.active) {
        LayoutController.toast('info', 'Trying to connect with the server.', 2000)
        editNoteSocketReconnecting.flag = true
    } else {
        LayoutController.toast('error', "Can't connect with the server.")
        console.error(`>>> connect_error due to ${err.message}`)
    }
})

normalEditorSocket.on(ENoteEvents.NOTE_FORM_EDITED, async (data: TNoteForm) => {
    const realtimeMode = getRealtimeModeInDevice()
    if (realtimeMode && realtimeMode === 'sync') {
        setForNoteFormEdited(data)
    } else {
        const notifyNoteEditedMode = getNotifyNoteEditedModeInDevice()
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

    static async broadcastNoteTyping(note: TNoteForm): Promise<void> {
        LayoutController.setUIOfGeneralAppStatus('loading')
        normalEditorSocket
            .timeout(EBroadcastTimeouts.EDIT_NOTE_TIMEOUT)
            .emit(
                ENoteEvents.NOTE_FORM_EDITED,
                note,
                (err: Error, res: TBroadcastNoteTypingRes) => {
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
                },
            )
    }

    static async fetchNoteContent(): Promise<void> {
        normalEditorSocket
            .timeout(EBroadcastTimeouts.EDIT_NOTE_TIMEOUT)
            .emit(ENoteEvents.FETCH_NOTE_FORM, (err: Error, res: TBroadcastNoteTypingRes) => {
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
