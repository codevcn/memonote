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
    domain: string
    path: string
    httpOnly: boolean
    secure: boolean
    sameSite: boolean
}

export type TAuthSocketConnectionReturn = {
    noteUniqueName: string
}
