import type { TSuccess } from '@/utils/types'
import type { RequestLangDTO } from './DTOs'
import type { Response } from 'express'

export interface ILangAPIController {
    requestLang: (res: Response, payload: RequestLangDTO) => Promise<TSuccess>
}
