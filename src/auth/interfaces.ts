import type { CookieOptions, Response } from 'express'
import type { TRemoveJWTParams, TSendJWTParams, TJWTPayload } from './types'

export interface IJWTService {
    getJWTcookieOtps: () => CookieOptions
    createJWT: (payload: TJWTPayload) => Promise<string>
    sendJWTToClient: (res: Response, payload: TSendJWTParams) => void
    removeJWTAtClient: (res: Response, payload: TRemoveJWTParams) => void
    verifyToken: (token: string) => Promise<TJWTPayload>
}
