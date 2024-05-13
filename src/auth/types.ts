import type { TNoteDocument } from '@/note/note.schema'
import type { CookieOptions } from 'express'

export type TJWTPayload = {
    noteUniqueName: string
}

export type TSendJWTParams = {
    token: string
    cookieOtps?: CookieOptions
}

export type TRemoveJWTParams = {
    cookieOtps?: CookieOptions
}

export type TSignInParams = {
    note: TNoteDocument
    password: string
}
