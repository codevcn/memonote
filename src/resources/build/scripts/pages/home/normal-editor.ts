enum ENoteEvents {
    NOTE_FORM_EDITED = 'note_form_edited',
    FETCH_NOTE_FORM = 'fetch_note_form',
}
type TBroadcastNoteTypingRes = {
    data: TNoteForm
    success: boolean
}

class NormalEditorSocket {
    private socket: any
    private readonly reconnecting: TSocketReconnecting = { flag: false }

    constructor() {
        this.socket = io(`/${ENamespacesOfSocket.NORMAL_EDITOR}`, clientSocketConfig)
        this.socket.on(EInitSocketEvents.CLIENT_CONNECTED, this.listenConnected)
        this.socket.on(EInitSocketEvents.CONNECT_ERROR, this.listenConnectionError)
        this.socket.on(ENoteEvents.NOTE_FORM_EDITED, this.listenNoteFormEdited)
    }

    private async listenConnected(data: TClientConnectedEventPld): Promise<void> {
        if (this.reconnecting.flag) {
            LayoutController.toast('success', 'Connected to server.', 2000)
            this.reconnecting.flag = false
        }
        console.log('>>> normal Editor Socket connected to server.')
    }

    private async listenConnectionError(err: Error): Promise<void> {
        if (this.socket.active) {
            LayoutController.toast('info', 'Trying to connect with the server.', 2000)
            this.reconnecting.flag = true
        } else {
            LayoutController.toast('error', "Can't connect with the server.")
            console.error(`>>> normal Editor connect_error due to ${err.message}`)
        }
    }

    async listenNoteFormEdited(data: TNoteForm): Promise<void> {
        const realtimeMode = LocalStorageController.getRealtimeMode()
        if (realtimeMode && realtimeMode === 'sync') {
            setForNoteFormEdited(data)
        } else {
            const notifyNoteEditedMode = LocalStorageController.getNotifyNoteEditedMode()
            if (notifyNoteEditedMode && notifyNoteEditedMode === 'on') {
                LayoutController.notifyNoteEdited('on', data)
            }
        }
    }

    emitWithoutTimeout<T>(event: string, payload: T, cb: TUnknownFunction<void>): void {
        this.socket.emit(event, payload, cb)
    }

    emitWithTimeout<T>(event: string, payload: T, cb: TUnknownFunction<void>, timeout: number) {
        this.socket.timeout(timeout).emit(event, payload, cb)
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

    static async broadcastNoteTyping(note: TNoteForm): Promise<void> {
        LayoutController.setGeneralAppStatus('loading')
        normalEditorSocket.emitWithTimeout<TNoteForm>(
            ENoteEvents.NOTE_FORM_EDITED,
            note,
            (err: Error, res: TBroadcastNoteTypingRes) => {
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

    static async fetchNoteContent(): Promise<void> {
        normalEditorSocket.emitWithTimeout<{}>(
            ENoteEvents.FETCH_NOTE_FORM,
            {},
            (err: Error, res: TBroadcastNoteTypingRes) => {
                LayoutController.notifyNoteEdited('off', {
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
