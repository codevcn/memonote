type TResBodySuccess = {
    success: boolean
}

type TResBodyHttpException = {
    name: string
    message: string
    timestamp: Date
    isUserException: boolean
    status: number
}

type TOriginalAPIError = {
    [key: string]: any
}

type TAPIError = {
    httpStatus: number
    isUserError: boolean
    message: string
    originalError: TOriginalAPIError
}
