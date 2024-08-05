// init types, enums, ...
enum ENoteEvents {
    NOTE_FORM_EDITED = 'note_form_edited',
    FETCH_NOTE_FORM = 'fetch_note_form',
}

type TBroadcastNoteTypingRes = {
    data: TNoteForm
    success: boolean
}
type TClientSocketConfig = {
    autoConnect: boolean
    withCredentials: boolean
}

const clientSocketConfig: TClientSocketConfig = {
    autoConnect: true,
    withCredentials: true,
}

// init socket
const editNoteSocket = io(`/${ENamespacesOfSocket.EDIT_NOTE}`, clientSocketConfig)

// init vars
const editNoteSocketReconnecting: TSocketReconnecting = { flag: false }

// listeners
editNoteSocket.on(EInitSocketEvents.CLIENT_CONNECTED, async (data: TClientConnectedEventPld) => {
    if (editNoteSocketReconnecting.flag) {
        LayoutController.toast('success', 'Connected to server.', 2000)
        editNoteSocketReconnecting.flag = false
    }
    console.log('>>> Socket connected to server.')
})

editNoteSocket.on(EInitSocketEvents.CONNECT_ERROR, async (err: Error) => {
    if (editNoteSocket.active) {
        LayoutController.toast('info', 'Trying to connect with the server.', 2000)
        editNoteSocketReconnecting.flag = true
    } else {
        LayoutController.toast('error', "Can't connect with the server.")
        console.error(`>>> connect_error due to ${err.message}`)
    }
})

editNoteSocket.on(ENoteEvents.NOTE_FORM_EDITED, async (data: TNoteForm) => {
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

// emitters
const broadcastNoteTyping = async (note: TNoteForm): Promise<void> => {
    LayoutController.setUIOfGeneralAppStatus('loading')
    editNoteSocket
        .timeout(EBroadcastTimeouts.EDIT_NOTE_TIMEOUT)
        .emit(ENoteEvents.NOTE_FORM_EDITED, note, (err: Error, res: TBroadcastNoteTypingRes) => {
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

const fetchNoteContent = async () => {
    editNoteSocket
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
