import { Socket } from 'socket.io'
import { EInitialSocketEvents } from './enums'
import type { TBroadcastNoteTypingReturn, TClientConnectedEventPayload } from './types'
import { BroadcastNoteTypingDTO } from './DTOs'
import type { TNoteForm } from '../types'

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    noteFormEdited: (
        data: BroadcastNoteTypingDTO,
        clientSocket: Socket,
    ) => Promise<TBroadcastNoteTypingReturn>
    fetchNoteContent: (clientSocket: Socket) => Promise<TBroadcastNoteTypingReturn>
}
