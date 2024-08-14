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

class LocalStorageController {
    static getRealtimeMode(): TRealtimeModeTypes | null {
        return localStorage.getItem(ELocalStorageKeys.REALTIME_MODE) as TRealtimeModeTypes | null
    }

    static setRealtimeMode(type: TRealtimeModeTypes): void {
        localStorage.setItem(ELocalStorageKeys.REALTIME_MODE, type)
    }

    static getNotifyNoteEditedMode(): TModeStatus | null {
        return localStorage.getItem(
            ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE,
        ) as TModeStatus | null
    }

    static setNotifyNoteEditedMode(status: TModeStatus): void {
        localStorage.setItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE, status)
    }

    static getEditedNotifyStyle(): TEditedNotifyStyleTypes | null {
        return localStorage.getItem(
            ELocalStorageKeys.EDITING_NOTIFY_STYLE,
        ) as TEditedNotifyStyleTypes | null
    }

    static setEditedNotifyStyle(type: TEditedNotifyStyleTypes): void {
        localStorage.setItem(ELocalStorageKeys.EDITING_NOTIFY_STYLE, type)
    }

    static getCssVariable(variableName: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
    }

    static getNightMode(): TModeStatus | null {
        return localStorage.getItem(ELocalStorageKeys.NIGHT_MODE) as TModeStatus | null
    }

    static setNightMode(status: TModeStatus): void {
        localStorage.setItem(ELocalStorageKeys.NIGHT_MODE, status)
    }

    static getNoteFormTextFont(): TNoteFormTextFonts | null {
        return localStorage.getItem(
            ELocalStorageKeys.NOTE_FORM_TEXT_FONT,
        ) as TNoteFormTextFonts | null
    }

    static setNoteFormTextFont(font: TNoteFormTextFonts): void {
        localStorage.setItem(ELocalStorageKeys.NOTE_FORM_TEXT_FONT, font)
    }

    static writeCssVariable(cssVarName: string, value: string): void {
        document.documentElement.style.setProperty(cssVarName, value)
    }

    static setNavBarPos = (pos: TNavBarPos): void => {
        localStorage.setItem(ELocalStorageKeys.NAV_BAR_POS, pos)
    }

    static getNavBarPos = (): TNavBarPos => {
        return localStorage.getItem(ELocalStorageKeys.NAV_BAR_POS) as TNavBarPos
    }

    static setYourNote(noteUniqueName: string): void {
        localStorage.setItem(ELocalStorageKeys.CURRENT_NOTE, noteUniqueName)
    }

    static getYourNote(): string | null {
        const noteUniqueName = localStorage.getItem(ELocalStorageKeys.CURRENT_NOTE) as string
        return noteUniqueName || null
    }
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

const convertStringToChunks = (inputString: string, sizeInKBPerChunk: number): string[] => {
    const chunkSize = sizeInKBPerChunk * 1024

    const blob = new Blob([inputString])
    const size = blob.size

    if (size <= chunkSize) {
        return [inputString]
    }

    const chunks: string[] = []
    let start: number = 0
    let end: number
    while (start < inputString.length) {
        end = start + chunkSize
        chunks.push(inputString.slice(start, end))
        start = end
    }

    return chunks
}

const initUserActions = (): void => {
    const noteUniqueName = getNoteUniqueNameFromURL()
    LocalStorageController.setYourNote(noteUniqueName)
}
