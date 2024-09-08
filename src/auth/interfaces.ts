import type { Response, Request } from 'express'
import type { TSuccess } from '../utils/types.js'
import type { NoteUniqueNameDTO } from '../note/DTOs.js'
import type { SignInPayloadDTO } from './DTOs.js'

export interface IAuthAPIController {
    signIn(
        params: NoteUniqueNameDTO,
        signInPayload: SignInPayloadDTO,
        res: Response,
    ): Promise<TSuccess>
    logout(req: Request, res: Response, params: NoteUniqueNameDTO): Promise<TSuccess>
}
