import type { CookieOptions } from 'express'

export type TJWTPayload = {
    noteUniqueName: string
}

export type TSendJWTParamOptions = {
    token: string
    cookieOtps?: CookieOptions
}

export type TJwtCookieOptions = {
    maxAge: number
    path: string
    httpOnly: boolean
    secure: boolean
    sameSite: boolean
}

export type TAuthSocketConnection = {
    noteUniqueName: string
}
