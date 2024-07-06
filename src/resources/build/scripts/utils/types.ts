// others
type TAxiosRes<T> = {
    [key: string]: any
    data: T
}

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

type TCommonStatus = 'success' | 'error' | 'warning'

type TNoteForm = {
    title?: string
    author?: string
    content?: string
}

type TRealtimeModeTypes = 'sync' | 'stop'

type TNotifyNoteEditedModeTypes = 'on' | 'off'

type TEditedNotifyStyleTypes = 'blink' | 'slither'

type TFormCheckValues = null | 'on'

type TNotif = {
    title: string
    message: string
    read: boolean
    type: ENotificationTypes
    createdAt: string
}
