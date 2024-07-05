import type { Socket } from 'socket.io'
import type { EInitialSocketEvents } from '@/utils/enums'
import type { TBroadcastNoteTypingReturn, TClientConnectedEventPayload } from './types'
import type { BroadcastNoteTypingDTO } from './DTOs'

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    noteFormEdited: (
        data: BroadcastNoteTypingDTO,
        clientSocket: Socket,
    ) => Promise<TBroadcastNoteTypingReturn>
    fetchNoteForm: (clientSocket: Socket) => Promise<TBroadcastNoteTypingReturn>
}
