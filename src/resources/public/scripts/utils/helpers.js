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
    const pathname = window.location.pathname
    return pathname.substring(pathname.lastIndexOf('/') + 1)
}
const refreshPageAfterMs = (timeToRefresh) => {
    setTimeout(() => {
        window.location.reload()
    }, timeToRefresh)
}
const redirectAfterMs = (timeToRedirect, href) => {
    setTimeout(() => {
        window.location.href = href
    }, timeToRedirect)
}
const getRealtimeModeInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.REALTIME_MODE)
}
const setRealtimeModeInDevice = (type) => {
    localStorage.setItem(ELocalStorageKeys.REALTIME_MODE, type)
}
const getNotifyNoteEditedModeInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE)
}
const setNotifyNoteEditedModeInDevice = (type) => {
    localStorage.setItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE, type)
}
const getEditedNotifyStyleInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.EDITING_NOTIFY_STYLE)
}
const setEditedNotifyStyleInDevice = (type) => {
    localStorage.setItem(ELocalStorageKeys.EDITING_NOTIFY_STYLE, type)
}
function getCssVariable(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
}
