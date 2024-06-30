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
    return window.location.pathname.slice(1)
}

const refreshPageAfterMs = (timeToRefresh: number): void => {
    setTimeout(() => {
        window.location.reload()
    }, timeToRefresh)
}

const getRealtimeModeInDevice = (): TRealtimeModeTypes | null => {
    return localStorage.getItem(ELocalStorageKeys.REALTIME_MODE) as TRealtimeModeTypes
}

const setRealtimeModeInDevice = (type: TRealtimeModeTypes): void => {
    localStorage.setItem(ELocalStorageKeys.REALTIME_MODE, type)
}

function getCssVariable(variableName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
}
