type TUnknownFunction = (...args: any) => void

function debounce<T extends TUnknownFunction>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this
        if (timeout !== null) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait)
    }
}

const getNoteUniqueNameFromURL = (): string => {
    const pathname = window.location.pathname
    return pathname.substring(pathname.lastIndexOf('/') + 1)
}

const refreshPageAfterMs = (timeToRefresh: number): void => {
    setTimeout(() => {
        window.location.reload()
    }, timeToRefresh)
}

const redirectAfterMs = (timeToRedirect: number, href: string): void => {
    setTimeout(() => {
        window.location.href = href
    }, timeToRedirect)
}

const getRealtimeModeInDevice = (): TRealtimeModeTypes | null => {
    return localStorage.getItem(ELocalStorageKeys.REALTIME_MODE) as TRealtimeModeTypes | null
}

const setRealtimeModeInDevice = (type: TRealtimeModeTypes): void => {
    localStorage.setItem(ELocalStorageKeys.REALTIME_MODE, type)
}

const getNotifyNoteEditedModeInDevice = (): TNotifyNoteEditedModeTypes | null => {
    return localStorage.getItem(
        ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE,
    ) as TNotifyNoteEditedModeTypes | null
}

const setNotifyNoteEditedModeInDevice = (type: TNotifyNoteEditedModeTypes): void => {
    localStorage.setItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE, type)
}

const getEditedNotifyStyleInDevice = (): TEditedNotifyStyleTypes | null => {
    return localStorage.getItem(
        ELocalStorageKeys.EDITING_NOTIFY_STYLE,
    ) as TEditedNotifyStyleTypes | null
}

const setEditedNotifyStyleInDevice = (type: TEditedNotifyStyleTypes): void => {
    localStorage.setItem(ELocalStorageKeys.EDITING_NOTIFY_STYLE, type)
}

function getCssVariable(variableName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
}

function calculateTimeDifference(inputTime: string): string {
    const now = dayjs()
    const specifiedTime = dayjs(inputTime)
    const differenceInSeconds = Math.abs(now.diff(specifiedTime, 'second'))
    let timeUnit: string
    let timeCount: number = 0

    if (differenceInSeconds >= 31536000) {
        // greater than 12 months
        timeCount = Math.floor(differenceInSeconds / 31536000)
        timeUnit = 'y'
    } else if (differenceInSeconds >= 2678400) {
        // greater than 31 days
        timeCount = Math.floor(differenceInSeconds / 2678400)
        timeUnit = 'm'
    } else if (differenceInSeconds >= 86400) {
        // greater than 24 hours
        timeCount = Math.floor(differenceInSeconds / 86400)
        timeUnit = 'd'
    } else if (differenceInSeconds >= 3600) {
        // greater than 60 minutes
        timeCount = Math.floor(differenceInSeconds / 3600)
        timeUnit = 'h'
    } else if (differenceInSeconds >= 60) {
        // greater than 60 seconds
        timeCount = Math.floor(differenceInSeconds / 60)
        timeUnit = 'm'
    } else {
        timeCount = differenceInSeconds // seconds gap
        timeUnit = 's'
    }

    return timeCount + timeUnit
}
