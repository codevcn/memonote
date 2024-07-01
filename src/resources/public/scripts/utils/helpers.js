'use strict'
function debounce(func, wait) {
    let timeout
    return function (...args) {
        const context = this
        if (timeout !== null) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait)
    }
}
const getNoteUniqueNameFromURL = () => {
    return window.location.pathname.slice(1)
}
const refreshPageAfterMs = (timeToRefresh) => {
    setTimeout(() => {
        window.location.reload()
    }, timeToRefresh)
}
const getRealtimeModeInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.REALTIME_MODE)
}
const setRealtimeModeInDevice = (type) => {
    localStorage.setItem(ELocalStorageKeys.REALTIME_MODE, type)
}
const getNoteChangesDisplayModeInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE)
}
const setNoteChangesDisplayModeInDevice = (type) => {
    localStorage.setItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE, type)
}
function getCssVariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
}
