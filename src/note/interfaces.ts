import type { TSuccess } from '@/utils/types'
import { AddPasswordForNoteParamsDTO, AddPasswordForNotePayloadDTO } from './DTOs'
import type { Response } from 'express'

export interface INoteAPIController {
    setPasswordForNote(
        params: AddPasswordForNoteParamsDTO,
        payload: AddPasswordForNotePayloadDTO,
        res: Response<TSuccess>,
    ): Promise<TSuccess>
    removePasswordForNote(params: AddPasswordForNoteParamsDTO): Promise<TSuccess>
}
