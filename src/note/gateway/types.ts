import { Server } from 'socket.io'
import { BroadcastNoteTypingDTO } from './dtos'

export type TClientConnectedEventPayload = {
    connectionStatus: string
}

export type TBroadcastNoteTypingRes = {
    data: BroadcastNoteTypingDTO
    success: boolean
}
