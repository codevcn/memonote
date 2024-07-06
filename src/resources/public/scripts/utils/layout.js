'use strict'
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
const generalAppStatus = document.getElementById('general-app-status')
const notificationsBoard = document.getElementById('notifs-board') // maybe null
class LayoutController {
    static notifyNoteEdited(type, noteForm) {
        let baseClasses = ['notify-note-edited', 'slither', 'blink']
        let notifyNoteEditedClass = ['notify-note-edited']
        notifyNoteEditedClass.push(getEditedNotifyStyleInDevice() || 'blink')
        let noteFormItem
        const { title, author, content } = noteForm
        if (title || title === '') {
            noteFormItem = noteFormEle.querySelector('.note-title')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (author || author === '') {
            noteFormItem = noteFormEle.querySelector('.note-author')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (content || content === '') {
            noteFormItem = noteFormEle.querySelector('.note-editor-board')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
    }
    static setUIOfGeneralAppStatus(status) {
        const icons = generalAppStatus.querySelectorAll('i')
        for (const icon of icons) {
            if (icon.classList.contains(`${status}-icon`)) {
                icon.hidden = false
            } else {
                icon.hidden = true
            }
        }
        generalAppStatus.classList.remove('inactive')
        setTimeout(() => {
            generalAppStatus.classList.add('inactive')
        }, this.GENERAL_STATUS_TIMEOUT)
    }
    static toast(type, message, durationInMs = this.NOTIFICATION_TIMEOUT) {
        if (this.toasterTimer) {
            clearTimeout(this.toasterTimer)
        }
        const notification = document.getElementById('app-toaster')
        notification.querySelector('.text-content').textContent = message
        notification.className = ''
        const icon = notification.querySelector('.icon-type')
        if (type === 'success') {
            notification.classList.add('success')
            icon.innerHTML = '<i class="success-icon bi bi-check-circle-fill"></i>'
        } else if (type === 'error') {
            notification.classList.add('error')
            icon.innerHTML = '<i class="error-icon bi bi-x-circle-fill"></i>'
        } else {
            icon.innerHTML = '<i class="info-icon bi bi-question-circle-fill"></i>'
        }
        const progressBar = notification.querySelector('.progress-bar')
        progressBar.classList.remove('running-a', 'running-b')
        progressBar.style.animationDuration = `${durationInMs / 1000}s`
        notification.style.animationDuration = `${durationInMs / 1000}.4s`
        if (this.toasterAnimationFlag) {
            notification.classList.add('show-a')
            progressBar.classList.add('running-a')
            this.toasterAnimationFlag = false
        } else {
            notification.classList.add('show-b')
            progressBar.classList.add('running-b')
            this.toasterAnimationFlag = true
        }
        this.toasterTimer = setTimeout(() => {
            progressBar.classList.remove('running-a', 'running-b')
        }, durationInMs)
    }
    static closeAppToaster(target) {
        const toasterTimer = LayoutController.toasterTimer
        if (toasterTimer) {
            clearTimeout(toasterTimer)
        }
        target.classList.add('clicked')
    }
    static switchTab(target, standing) {
        const navigationSection = target.closest('.navigation-section')
        const tabs = navigationSection.querySelectorAll('.tabs .tab-btn')
        for (const tab of tabs) {
            tab.classList.remove('active')
        }
        target.classList.add('active')
        const destinations = navigationSection.querySelectorAll('.destination')
        for (const destination of destinations) {
            destination.classList.remove('active')
            if (destination.classList.contains(standing)) {
                destination.classList.add('active')
            }
        }
    }
}
LayoutController.NOTIFICATION_TIMEOUT = 3000
LayoutController.GENERAL_STATUS_TIMEOUT = 3000
LayoutController.toasterAnimationFlag = true
LayoutController.toasterTimer = null
class NotificationsController {
    static addNotifs(notifPayloads, clearAllBeforeAdd = false) {
        if (notificationsBoard) {
            const notifsContainer = notificationsBoard.querySelector('.notifs-content .notifs')
            if (clearAllBeforeAdd) {
                notifsContainer.innerHTML = ''
            }
            for (const notifPayload of notifPayloads) {
                notifsContainer.appendChild(Materials.createElementNotif(notifPayload))
            }
        }
    }
    static showNotificationsBoard(show) {
        if (notificationsBoard) {
            notificationsBoard.classList.remove('active')
            if (show) {
                notificationsBoard.classList.add('active')
            }
        }
    }
}
const initLayout = () => {
    // setup "notification" section
    const notification = document.querySelector('#nav-bar .notification')
    if (notification) {
        const tabs = notification.querySelectorAll('#notifs-board .tabs .tab-btn')
        for (const tab of tabs) {
            tab.addEventListener('click', function (e) {
                LayoutController.switchTab(tab, tab.getAttribute('data-mmn-tab-value'))
            })
        }
    }
}
initLayout()
