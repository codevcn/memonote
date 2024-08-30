import type { TSuccess } from '@/utils/types'
import type {
    NoteUniqueNameDTO,
    SetPasswordForNotePayloadDTO,
    SwitchEditorPayloadDTO,
} from './DTOs'
import type { Response } from 'express'
import type { ELangCodes } from '@/lang/enums'
import type { Socket } from 'socket.io'
import type { EInitialSocketEvents } from '@/utils/enums'
import type { TBroadcastNoteTypingReturn, TClientConnectedEventPayload } from './types'
import type { BroadcastNoteTypingDTO } from './DTOs'

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
    ) => Promise<TBroadcastNoteTypingReturn>
    fetchNoteForm: (clientSocket: Socket) => Promise<TBroadcastNoteTypingReturn>
}
