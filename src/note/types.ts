import type { BroadcastNoteTypingDTO } from './DTOs.js'

export type TGetHomePageData = {
    noteContent: string | null
}

export type TNoteForm = {
    title?: string
    author?: string
    content?: string
}

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
