import type { TApplicationInfo } from '../utils/application/types.js'

export type TUnknownFunction<R> = (...args: any[]) => R

export type TSuccess = {
    success: boolean
}

export type THttpExceptionResBody = {
    name: string
    message: string
    timestamp: Date
    isUserException: boolean
    status: number
    lang: string
}

export type TCustomExceptionPayload = {
    message: string
    name: string
    stack: string
    status: number
    isUserException: boolean
}

export type TRedirectController = {
    url: string
}

export type TCommonPageData = {
    appInfo: TApplicationInfo
    verified: boolean
}
