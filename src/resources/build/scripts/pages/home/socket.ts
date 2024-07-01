enum ENamespacesOfSocket {
    EDIT_NOTE = 'edit-note',
}
enum ENoteEvents {
    CLIENT_CONNECTED = 'client_connected',
    NOTE_TYPING = 'note_typing',
}

type TClientConnectedEventPayload = {
    connectionStatus: string
}
type TBroadcastNoteTypingRes = {
    data: TNoteForm
    success: boolean
}

// vars
const clientSocketReconnecting = { value: false }

// sockets
const clientSocket = io(`/${ENamespacesOfSocket.EDIT_NOTE}`, {
    autoConnect: true,
    withCredentials: true,
})

clientSocket.on(ENoteEvents.CLIENT_CONNECTED, async (data: TClientConnectedEventPayload) => {
    if (clientSocketReconnecting.value) {
        LayoutUI.toast('success', 'Connected to server.', 2000)
        clientSocketReconnecting.value = false
    }
    console.log('>>> Socket connected to server.')
})

clientSocket.on('connect_error', async (err: { [key: string]: any; message: any }) => {
    if (clientSocket.active) {
        LayoutUI.toast('info', 'Trying to connect with the server.', 2000)
        clientSocketReconnecting.value = true
    } else {
        LayoutUI.toast('error', "Can't connect with the server.")
        console.error(`>>> connect_error due to ${err.message}`)
    }
})

clientSocket.on(ENoteEvents.NOTE_TYPING, async (data: TNoteForm) => {
    const realtimeMode = getRealtimeModeInDevice()
    if (realtimeMode && realtimeMode === 'sync') {
        setForNoteFormChanged(data)
    } else {
        const noteChangesDisplayMode = getNoteChangesDisplayModeInDevice()
        if (noteChangesDisplayMode && noteChangesDisplayMode === 'on') {
            LayoutUI.setNoteFormChangsDisplay('on', data)
        }
    }
})

// handlers
const broadcastNoteTyping = async (note: TNoteForm): Promise<void> => {
    clientSocket
        .timeout(EBroadcastTimeout.NOTE_TYPING_TIMEOUT)
        .emit(ENoteEvents.NOTE_TYPING, note, (err: any, res: TBroadcastNoteTypingRes) => {
            if (err) {
                LayoutUI.setUIOfGeneralAppStatus('error')
                console.log('>>> broadcast err >>>', err)
            } else {
                if (res.success) {
                    LayoutUI.setUIOfGeneralAppStatus('success')
                } else {
                    LayoutUI.setUIOfGeneralAppStatus('error')
                }
                console.log('>>> broadcast res >>>', res)
            }
        })
}
