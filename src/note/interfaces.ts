import type { TSuccess } from '@/utils/types'
import type {
    NoteUniqueNameParamsDTO,
    SetPasswordForNotePayloadDTO,
    SwitchEditorPayloadDTO,
} from './DTOs'
import type { Response } from 'express'

export interface INoteAPIController {
    setPasswordForNote(
        params: NoteUniqueNameParamsDTO,
        payload: SetPasswordForNotePayloadDTO,
        res: Response<TSuccess>,
    ): Promise<TSuccess>
    removePasswordForNote(params: NoteUniqueNameParamsDTO): Promise<TSuccess>
    switchEditor(
        params: NoteUniqueNameParamsDTO,
        payload: SwitchEditorPayloadDTO,
    ): Promise<TSuccess>
}
