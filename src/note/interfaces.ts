import type { TSuccess } from '@/utils/types'
import type {
    NoteUniqueNameDTO,
    SetPasswordForNotePayloadDTO,
    SwitchEditorPayloadDTO,
} from './DTOs'
import type { Response } from 'express'
import type { ELangCodes } from '@/lang/enums'

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
