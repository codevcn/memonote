enum ENoteEvents {
    NOTE_FORM_EDITED = 'note_form_edited',
    FETCH_NOTE_FORM = 'fetch_note_form',
    TRANSCRIBE_AUDIO = 'transcript_auido',
}
type TBroadcastNoteTypingRes = {
    data: TNoteForm
    success: boolean
}
type TTranscribeAudioState = {
    state: 'transcribing'
}

class NormalEditorSocket {
    private readonly socket: any
    private readonly reconnecting: TSocketReconnecting

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

    private async listenConnected(): Promise<void> {
        this.socket.on(EInitSocketEvents.CLIENT_CONNECTED, (data: TClientConnectedEventPld) => {
            if (this.reconnecting.flag) {
                LayoutController.toast('success', 'Connected to server.', 2000)
                this.reconnecting.flag = false
            }
            console.log('>>> normal Editor Socket connected to server.')
        })
    }

    private async listenConnectionError(): Promise<void> {
        this.socket.on(EInitSocketEvents.CONNECT_ERROR, (err: Error) => {
            if (this.socket.active) {
                LayoutController.toast('info', 'Trying to connect with the server.', 2000)
                this.reconnecting.flag = true
            } else {
                LayoutController.toast('error', "Can't connect with the server.")
                console.error(`>>> Normal Editor connect_error due to >>> ${err.message}`)
            }
        })
    }

    private async listenNoteFormEdited(): Promise<void> {
        this.socket.on(ENoteEvents.NOTE_FORM_EDITED, (data: TNoteForm) => {
            const realtimeMode = LocalStorageController.getRealtimeMode()
            if (realtimeMode && realtimeMode === 'sync') {
                setContentNoteFormEdited(data)
            } else {
                const notifyNoteEditedMode = LocalStorageController.getNotifyNoteEditedMode()
                if (notifyNoteEditedMode && notifyNoteEditedMode === 'on') {
                    NormalEditorController.notifyNoteEdited('on', data)
                }
            }
        })
    }

    emitWithoutTimeout<T>(event: ENoteEvents, payload: T, cb: TUnknownFunction<void>): void {
        this.socket.emit(event, payload, cb)
    }

    emitWithTimeout<T>(
        event: ENoteEvents,
        payload: T,
        cb: TUnknownFunction<void>,
        timeout: number,
    ) {
        this.socket.timeout(timeout).emit(event, payload, cb)
    }

    getSocketId(): string {
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

    static notifyNoteEdited(type: 'on' | 'off', noteForm: TNoteForm): void {
        let baseClasses: string[] = ['notify-note-edited', 'slither', 'blink']
        let notifyNoteEditedClass: string[] = ['notify-note-edited']
        notifyNoteEditedClass.push(LocalStorageController.getEditedNotifyStyle() || 'blink')
        let noteFormItem: HTMLElement
        const { title, author, content } = noteForm
        const noteFormEle = homePage_pageMain.querySelector('#note-form') as HTMLElement
        if (title || title === '') {
            noteFormItem = noteFormEle.querySelector('.note-title') as HTMLElement
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (author || author === '') {
            noteFormItem = noteFormEle.querySelector('.note-author') as HTMLElement
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (content || content === '') {
            noteFormItem = noteFormEle.querySelector('.note-editor-board') as HTMLElement
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
    }

    static async fetchNoteContent(): Promise<void> {
        normalEditorSocket.emitWithTimeout<{}>(
            ENoteEvents.FETCH_NOTE_FORM,
            {},
            (err: Error, res: TBroadcastNoteTypingRes) => {
                NormalEditorController.notifyNoteEdited('off', {
                    title: 'true',
                    author: 'true',
                    content: 'true',
                })
                if (res.success) {
                    setContentNoteFormEdited(res.data)
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
