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

const getNotifyNoteEditedModeInDevice = (): TNotifyNoteEditedTypes | null => {
    return localStorage.getItem(
        ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE,
    ) as TNotifyNoteEditedTypes | null
}

const setNotifyNoteEditedModeInDevice = (type: TNotifyNoteEditedTypes): void => {
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
