type TUnknownFunction = (...args: any) => void

const debounce = (func: TUnknownFunction, timeout: number = 300): TUnknownFunction => {
    let timer: any
    return (...args: any) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func(...args)
        }, timeout)
    }
}

const getNoteUniqueNameFromURL = (): string => {
    return window.location.pathname.slice(1)
}
