import type { TNoteDocument } from '@/database/note.model'
import type { CookieOptions } from 'express'

export type TJWTPayload = {
    noteUniqueName: string
}

export type TSendJWTParamOptions = {
    token: string
    cookieOtps?: CookieOptions
}

export type TSignInParams = {
    note: TNoteDocument
    password: string
}

export type TJwtCookieOptions = {
    maxAge: number
    domain: string
    path: string
    httpOnly: boolean
    secure: boolean
    sameSite: boolean
}
