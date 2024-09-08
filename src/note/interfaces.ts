import type { TSuccess } from '../utils/types.js'
import type {
    NoteCredentialsDTO,
    NoteUniqueNameDTO,
    SetPasswordForNotePayloadDTO,
    SwitchEditorPayloadDTO,
} from './DTOs.js'
import type { Response } from 'express'
import type { ELangCodes } from '../lang/constants.js'
import type { Socket } from 'socket.io'
import type { EInitialSocketEvents } from '../utils/constants.js'
import type { TBroadcastNoteTypingReturn, TClientConnectedEventPayload } from './types.js'
import type { BroadcastNoteTypingDTO } from './DTOs.js'

export interface INoteAPIController {
    setPasswordForNote(
        params: NoteUniqueNameDTO,
        payload: SetPasswordForNotePayloadDTO,
        res: Response<TSuccess>,
        lang: ELangCodes,
    ): Promise<TSuccess>
    removePasswordForNote(params: NoteUniqueNameDTO, lang: ELangCodes): Promise<TSuccess>
    switchEditor(params: NoteUniqueNameDTO, payload: SwitchEditorPayloadDTO): Promise<TSuccess>
}

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    noteFormEdited: (
        data: BroadcastNoteTypingDTO,
        clientSocket: Socket,
        noteInfo: NoteCredentialsDTO,
    ) => Promise<TBroadcastNoteTypingReturn>
    fetchNoteForm: (
        clientSocket: Socket,
        noteInfo: NoteCredentialsDTO,
    ) => Promise<TBroadcastNoteTypingReturn>
}
