export type TSuccess = {
    success: boolean // always true
}

export type THttpExceptionResBody = {
    name: string
    message: string
    timestamp: Date
    isUserException: boolean
    status: number
}

export type TCustomExceptionPayload = {
    message: string
    name: string
    stack: string
    status: number
    isUserException: boolean
}
