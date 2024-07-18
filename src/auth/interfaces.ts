import type { Response, Request } from 'express'
import type { TSuccess } from '@/utils/types'
import type { NoteUniqueNameOnParamDTO, SignInPayloadDTO } from './DTOs'

export interface IAuthAPIController {
    signIn(
        params: NoteUniqueNameOnParamDTO,
        signInPayload: SignInPayloadDTO,
        res: Response,
    ): Promise<TSuccess>
    logout(req: Request, res: Response, params: NoteUniqueNameOnParamDTO): Promise<TSuccess>
}
