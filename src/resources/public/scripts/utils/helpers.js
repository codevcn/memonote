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
const setNotifyNoteEditedModeInDevice = (status) => {
    localStorage.setItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE, status)
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
const getNightModeInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.NIGHT_MODE)
}
const setNightModeInDevice = (status) => {
    localStorage.setItem(ELocalStorageKeys.NIGHT_MODE, status)
}
const convertToCssFontFamily = (font) => {
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
const getNoteFormTextFontInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.NOTE_FORM_TEXT_FONT)
}
const setNoteFormTextFontInDevice = (font) => {
    localStorage.setItem(ELocalStorageKeys.NOTE_FORM_TEXT_FONT, font)
}
const writeCssVariable = (cssVarName, value) => {
    document.documentElement.style.setProperty(cssVarName, value)
}
function convertStringToChunks(inputString, sizeInKBPerChunk) {
    const chunkSize = sizeInKBPerChunk * 1024
    const blob = new Blob([inputString])
    const size = blob.size
    console.log('>>> size info >>>', { size })
    if (size <= chunkSize) {
        return [inputString]
    }
    const chunks = []
    let start = 0
    let end
    while (start < inputString.length) {
        end = start + chunkSize
        chunks.push(inputString.slice(start, end))
        start = end
    }
    return chunks
}
const setNavBarPosInDevice = (pos) => {
    localStorage.setItem(ELocalStorageKeys.NAV_BAR_POS, pos)
}
const getNavBarPosInDevice = () => {
    return localStorage.getItem(ELocalStorageKeys.NAV_BAR_POS)
}
