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

const getNotifyNoteEditedModeInDevice = (): TModeStatus | null => {
    return localStorage.getItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE) as TModeStatus | null
}

const setNotifyNoteEditedModeInDevice = (status: TModeStatus): void => {
    localStorage.setItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE, status)
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

const getNightModeInDevice = (): TModeStatus | null => {
    return localStorage.getItem(ELocalStorageKeys.NIGHT_MODE) as TModeStatus | null
}

const setNightModeInDevice = (status: TModeStatus): void => {
    localStorage.setItem(ELocalStorageKeys.NIGHT_MODE, status)
}

const convertToCssFontFamily = (font: TNoteFormTextFonts) => {
    switch (font) {
        case 'work-sans':
            return "'Work Sans', Arial, sans-serif"
        case 'poppins':
            return "'Poppins', Arial, sans-serif"
        case 'arial':
            return 'Arial, Helvetica, sans-serif'
        case 'times-new-roman':
            return "'Times New Roman', Times, serif"
        case 'roboto':
            return "'Roboto', Times, serif"
    }
}

const getNoteFormTextFontInDevice = (): TNoteFormTextFonts | null => {
    return localStorage.getItem(ELocalStorageKeys.NOTE_FORM_TEXT_FONT) as TNoteFormTextFonts | null
}

const setNoteFormTextFontInDevice = (font: TNoteFormTextFonts): void => {
    localStorage.setItem(ELocalStorageKeys.NOTE_FORM_TEXT_FONT, font)
}

const writeCssVariable = (cssVarName: string, value: string): void => {
    document.documentElement.style.setProperty(cssVarName, value)
}
