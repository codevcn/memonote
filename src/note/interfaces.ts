import type { TSuccess } from '@/utils/types'
import { AddPasswordForNoteParamsDTO, AddPasswordForNotePayloadDTO } from './note.dto'
import type { Response } from 'express'

export interface INoteAPIController {
    setPasswordForNote(
        params: AddPasswordForNoteParamsDTO,
        payload: AddPasswordForNotePayloadDTO,
        res: Response<TSuccess>,
    ): Promise<TSuccess>
    removePasswordForNote(params: AddPasswordForNoteParamsDTO): Promise<TSuccess>
}
