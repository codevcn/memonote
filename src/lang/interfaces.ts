import type { TSuccess } from '../utils/types.js'
import type { RequestLangDTO } from './DTOs.js'
import type { Response } from 'express'

export interface ILangAPIController {
    requestLang: (res: Response, payload: RequestLangDTO) => Promise<TSuccess>
}
