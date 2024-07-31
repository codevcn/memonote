import type { TSuccess } from '@/utils/types'
import type {
    NoteUniqueNameDTO,
    SetPasswordForNotePayloadDTO,
    SwitchEditorPayloadDTO,
} from './DTOs'
import type { Response } from 'express'

export interface INoteAPIController {
    setPasswordForNote(
        params: NoteUniqueNameDTO,
        payload: SetPasswordForNotePayloadDTO,
        res: Response<TSuccess>,
    ): Promise<TSuccess>
    removePasswordForNote(params: NoteUniqueNameDTO): Promise<TSuccess>
    switchEditor(params: NoteUniqueNameDTO, payload: SwitchEditorPayloadDTO): Promise<TSuccess>
}
