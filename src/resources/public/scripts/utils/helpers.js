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
function calculateTimeDifference(inputTime) {
    const now = dayjs()
    const specifiedTime = dayjs(inputTime)
    const differenceInSeconds = Math.abs(now.diff(specifiedTime, 'second'))
    let timeUnit
    let timeCount = 0
    if (differenceInSeconds >= 31536000) {
        // greater than 12 months
        timeCount = Math.floor(differenceInSeconds / 31536000)
        timeUnit = 'y'
    } else if (differenceInSeconds >= 2678400) {
        // greater than 31 days
        timeCount = Math.floor(differenceInSeconds / 2678400)
        timeUnit = 'm'
    } else if (differenceInSeconds >= 86400) {
        // greater than 24 hours
        timeCount = Math.floor(differenceInSeconds / 86400)
        timeUnit = 'd'
    } else if (differenceInSeconds >= 3600) {
        // greater than 60 minutes
        timeCount = Math.floor(differenceInSeconds / 3600)
        timeUnit = 'h'
    } else if (differenceInSeconds >= 60) {
        // greater than 60 seconds
        timeCount = Math.floor(differenceInSeconds / 60)
        timeUnit = 'm'
    } else {
        timeCount = differenceInSeconds // seconds gap
        timeUnit = 's'
    }
    return timeCount + timeUnit
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
