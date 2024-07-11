enum ENamespacesOfSocket {
    EDIT_NOTE = 'edit-note',
    NOTIFICATION = 'notification',
}
type TSocketReconnecting = {
    flag: boolean
}
enum TInitSocketEvents {
    CLIENT_CONNECTED = 'client_connected',
    CONNECT_ERROR = 'connect_error',
}

// === edit note section ===

// init types, enums, ...
enum ENoteEvents {
    NOTE_FORM_EDITED = 'note_form_edited',
    FETCH_NOTE_FORM = 'fetch_note_form',
}

type TClientConnectedEventPld = {
    connectionStatus: string
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
editNoteSocket.on(TInitSocketEvents.CLIENT_CONNECTED, async (data: TClientConnectedEventPld) => {
    if (editNoteSocketReconnecting.flag) {
        LayoutController.toast('success', 'Connected to server.', 2000)
        editNoteSocketReconnecting.flag = false
    }
    console.log('>>> Socket connected to server.')
})

editNoteSocket.on(TInitSocketEvents.CONNECT_ERROR, async (err: Error) => {
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
        setForNoteFormChanged(data)
    } else {
        const notifyNoteEditedMode = getNotifyNoteEditedModeInDevice()
        if (notifyNoteEditedMode && notifyNoteEditedMode === 'on') {
            LayoutController.notifyNoteEdited('on', data)
        }
    }
})

// emitters
const broadcastNoteTyping = async (note: TNoteForm): Promise<void> => {
    editNoteSocket
        .timeout(EBroadcastTimeouts.NOTE_TYPING_TIMEOUT)
        .emit(ENoteEvents.NOTE_FORM_EDITED, note, (err: Error, res: TBroadcastNoteTypingRes) => {
            if (err) {
                LayoutController.setUIOfGeneralAppStatus('error')
                console.log('>>> broadcast err >>>', err)
            } else {
                if (res.success) {
                    LayoutController.setUIOfGeneralAppStatus('success')
                } else {
                    LayoutController.setUIOfGeneralAppStatus('error')
                }
                console.log('>>> broadcast res >>>', res)
            }
        })
}

const fetchNoteContent = async () => {
    editNoteSocket
        .timeout(EBroadcastTimeouts.NOTE_TYPING_TIMEOUT)
        .emit(ENoteEvents.FETCH_NOTE_FORM, (err: Error, res: TBroadcastNoteTypingRes) => {
            LayoutController.notifyNoteEdited('off', {
                title: 'true',
                author: 'true',
                content: 'true',
            })
            if (res.success) {
                setForNoteFormChanged(res.data)
            }
        })
}

// === notification section ===

// init types, enums, ...
enum ENotificationEvents {
    NOTIFY = 'notify',
}

// init socket
const notificationSocket = io(`/${ENamespacesOfSocket.NOTIFICATION}`, clientSocketConfig)

// init vars
const notificationSocketReconnecting: TSocketReconnecting = { flag: false }

// listeners
notificationSocket.on(
    TInitSocketEvents.CLIENT_CONNECTED,
    async (data: TClientConnectedEventPld) => {
        if (notificationSocketReconnecting.flag) {
            LayoutController.toast('success', 'Connected to server.', 2000)
            notificationSocketReconnecting.flag = false
        }
        console.log('>>> Socket connected to server.')
    },
)

notificationSocket.on(TInitSocketEvents.CONNECT_ERROR, async (err: Error) => {
    if (editNoteSocket.active) {
        LayoutController.toast('info', 'Trying to connect with the server.', 2000)
        notificationSocketReconnecting.flag = true
    } else {
        LayoutController.toast('error', "Can't connect with the server.")
        console.error(`>>> connect_error due to ${err.message}`)
    }
})

// listeners
notificationSocket.on(ENotificationEvents.NOTIFY, async (notif: TNotif) => {
    NotificationsController.addNewNotif({ ...notif, isNew: true })
})
