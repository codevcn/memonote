type TSocketReconnecting = {
    flag: boolean
}
type TClientConnectedEventPld = {
    connectionStatus: string
}

type TAxiosHTTPRes<T> = {
    [key: string]: any
    data: T
}

type TSuccess = {
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

type TCommonStatus = 'success' | 'error' | 'warning' | 'loading'

type TNoteForm = {
    title?: string
    author?: string
    content?: string
}

type TRealtimeModeTypes = 'sync' | 'stop'

type TModeStatus = 'on' | 'off'

type TEditedNotifyStyleTypes = 'blink' | 'slither'

type TNoteFormTextFonts = 'work-sans' | 'arial' | 'poppins' | 'times-new-roman' | 'roboto'

type TLanguages = 'Vietnamese' | 'English'

type TFormCheckValues = null | 'on'

type TTranslationNotif = {
    message: string
    type: string
    createdAt: string
}

type TNotif = {
    _id: string
    message: string
    type: ENotificationTypes
    createdAt: string
    translation: TTranslationNotif
}

type TNotifData = TNotif & {
    isNew: boolean
}

type TNavBarPos = 'sticky' | 'static'
