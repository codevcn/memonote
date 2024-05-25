'use strict'
const debounce = (func, timeout = 300) => {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func(...args)
        }, timeout)
    }
}
const getNoteUniqueNameFromURL = () => {
    return window.location.pathname.slice(1)
}
