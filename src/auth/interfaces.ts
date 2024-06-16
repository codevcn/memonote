import type { CookieOptions, Response } from 'express'
import type { TSendJWTParamOptions, TJWTPayload, TJwtCookieOptions } from './types'
import type { TSuccess } from '@/utils/types'
import type { GetNoteOnHomePageParamsDTO, SignInPayloadDTO } from './auth.dto'

export interface IJWTService {
    jwtCookieOptions: TJwtCookieOptions
    createJWT: (payload: TJWTPayload) => Promise<string>
    sendJWTToClient: (res: Response, payload: TSendJWTParamOptions) => void
    removeJWTAtClient: (res: Response, payload: CookieOptions) => void
    verifyToken: (token: string) => Promise<TJWTPayload>
}

export interface IAuthAPIController {
    logout(res: Response): Promise<TSuccess>
    signIn(
        params: GetNoteOnHomePageParamsDTO,
        signInPayload: SignInPayloadDTO,
        res: Response,
    ): Promise<TSuccess>
}
