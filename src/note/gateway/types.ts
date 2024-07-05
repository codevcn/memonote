import type { BroadcastNoteTypingDTO } from './DTOs'

export type TClientConnectedEventPayload = {
    connectionStatus: string
}

export type TBroadcastNoteTypingReturn = {
    data: BroadcastNoteTypingDTO
    success: boolean
}

export type TValidateIncommingSocketReturn = {
    noteUniqueName: string
}
