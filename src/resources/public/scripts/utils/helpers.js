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
class LocalStorageController {
    static getRealtimeMode() {
        return localStorage.getItem(ELocalStorageKeys.REALTIME_MODE)
    }
    static setRealtimeMode(type) {
        localStorage.setItem(ELocalStorageKeys.REALTIME_MODE, type)
    }
    static getNotifyNoteEditedMode() {
        return localStorage.getItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE)
    }
    static setNotifyNoteEditedMode(status) {
        localStorage.setItem(ELocalStorageKeys.NOTE_CHANGES_DISPLAY_MODE, status)
    }
    static getEditedNotifyStyle() {
        return localStorage.getItem(ELocalStorageKeys.EDITING_NOTIFY_STYLE)
    }
    static setEditedNotifyStyle(type) {
        localStorage.setItem(ELocalStorageKeys.EDITING_NOTIFY_STYLE, type)
    }
    static getCssVariable(variableName) {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
    }
    static getNightMode() {
        return localStorage.getItem(ELocalStorageKeys.NIGHT_MODE)
    }
    static setNightMode(status) {
        localStorage.setItem(ELocalStorageKeys.NIGHT_MODE, status)
    }
    static getNoteFormTextFont() {
        return localStorage.getItem(ELocalStorageKeys.NOTE_FORM_TEXT_FONT)
    }
    static setNoteFormTextFont(font) {
        localStorage.setItem(ELocalStorageKeys.NOTE_FORM_TEXT_FONT, font)
    }
    static writeCssVariable(cssVarName, value) {
        document.documentElement.style.setProperty(cssVarName, value)
    }
    static setCurrentNote(noteUniqueName) {
        localStorage.setItem(ELocalStorageKeys.CURRENT_NOTE, noteUniqueName)
    }
    static getCurrentNote() {
        return localStorage.getItem(ELocalStorageKeys.CURRENT_NOTE)
    }
    static setHeightOfRichEditor(height) {
        localStorage.setItem(ELocalStorageKeys.HEIGHT_OF_EDITOR, height.toString())
    }
    static getHeightOfRichEditor() {
        return localStorage.getItem(ELocalStorageKeys.HEIGHT_OF_EDITOR)
    }
    static setCurrentEditor(editor) {
        localStorage.setItem(ELocalStorageKeys.CURRENT_EDITOR, editor)
    }
    static getCurrentEditor() {
        return localStorage.getItem(ELocalStorageKeys.CURRENT_EDITOR)
    }
}
LocalStorageController.setNavBarPos = (pos) => {
    localStorage.setItem(ELocalStorageKeys.NAV_BAR_POS, pos)
}
LocalStorageController.getNavBarPos = () => {
    return localStorage.getItem(ELocalStorageKeys.NAV_BAR_POS)
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
const convertStringToChunks = (inputString, sizePerChunk) => {
    const chunkSize = sizePerChunk
    const blob = new Blob([inputString])
    const size = blob.size
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
const initUserActions = () => {
    const noteUniqueName = getNoteUniqueNameFromURL()
    LocalStorageController.setCurrentNote(noteUniqueName)
}
function convertToBytes(input) {
    const units = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
        PB: 1024 ** 5,
    }
    const regex = /^(\d+(\.\d+)?)\s*(B|KB|MB|GB|TB|PB)$/i
    const match = input.match(regex)
    if (!match) {
        return null
    }
    const value = parseFloat(match[1])
    const unit = match[3].toUpperCase()
    return value * (units[unit] || 0)
}
