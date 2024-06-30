import type { CookieOptions, Response, Request } from 'express'
import type { TSendJWTParamOptions, TJWTPayload, TJwtCookieOptions } from './types'
import type { TSuccess } from '@/utils/types'
import type { NoteUniqueNameOnParamDTO, SignInPayloadDTO } from './auth.dto'

export interface IJWTService {
    jwtCookieOptions: TJwtCookieOptions
    createJWT: (payload: TJWTPayload) => Promise<string>
    sendJWTToClient: (res: Response, payload: TSendJWTParamOptions) => void
    removeJWTAtClient: (res: Response, payload: CookieOptions) => void
    verifyToken: (token: string) => Promise<TJWTPayload>
}

export interface IAuthAPIController {
    signIn(
        params: NoteUniqueNameOnParamDTO,
        signInPayload: SignInPayloadDTO,
        res: Response,
    ): Promise<TSuccess>
    logout(req: Request, res: Response, params: NoteUniqueNameOnParamDTO): Promise<TSuccess>
}
