'use strict'
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
const generalAppStatus = document.getElementById('general-app-status')
const notificationBtn = document.querySelector(
    '#nav-bar .right-side-menu .menu-item.notification .notification-btn',
)
const notificationsBoard = document.getElementById('notifs-board') // can be null
const notifsList =
    notificationsBoard === null || notificationsBoard === void 0
        ? void 0
        : notificationsBoard.querySelector('.notifs-content .notifs')
const notifsTabs =
    notificationsBoard === null || notificationsBoard === void 0
        ? void 0
        : notificationsBoard.querySelector('.notifs-content .tabs')
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
    static setNotifsData(notifsData) {
        this.notifsData = notifsData
        this.setCounter('all', notifsData.length)
        this.setCounter(
            'unread',
            notifsData.reduce((pre, notif) => (!notif.read ? pre + 1 : pre), 0),
        )
    }
    static addNotifData(notif) {
        if (!notificationBtn) return
        this.notifsData.push(notif)
        this.setCounter(
            'unread',
            this.notifsData.reduce((pre, notif) => (!notif.read ? pre + 1 : pre), 0) * 1,
        )
        // ring notification
        if (this.ringNotifTimer) {
            clearTimeout(this.ringNotifTimer)
        }
        notificationBtn.classList.remove('on-ring-a', 'on-ring-b')
        if (this.ringNotifFlag) {
            notificationBtn.classList.add('on-ring-a')
            this.ringNotifFlag = false
        } else {
            notificationBtn.classList.add('on-ring-b')
            this.ringNotifFlag = true
        }
        const ringDuration =
            parseFloat(getCssVariable('--mmn-ring-notification-duration').split('s')[0]) * 1000
        this.ringNotifTimer = setTimeout(() => {
            notificationBtn.classList.remove('on-ring-a', 'on-ring-b')
        }, ringDuration)
    }
    static getNotifsData() {
        return this.notifsData
    }
    static setCounter(category, count) {
        if (!notifsTabs || !notificationBtn) return
        const countInString = `${count}`
        notifsTabs.querySelector(`.tab-btn[data-mmn-tab-value='${category}'] .count`).textContent =
            countInString
        if (category === 'unread') {
            const badge = notificationBtn.querySelector('.icon-wrapper .badge')
            if (count > 0) {
                badge.classList.add('active')
            } else {
                badge.classList.remove('active')
            }
            badge.textContent = countInString
        }
    }
    static addNotif(notif) {
        if (!notifsList) return
        if (this.notifsData.length === 0) {
            notifsList.innerHTML = ''
        }
        this.addNotifData(notif)
        notifsList.prepend(Materials.createElementNotif(notif))
    }
    static setNotifs(category, notifsPayload) {
        if (notificationsBoard && notifsList && notifsPayload && notifsPayload.length > 0) {
            notifsList.innerHTML = ''
            this.setNotifsData(notifsPayload)
            let notifs = notifsPayload
            switch (category) {
                case 'unread':
                    notifs = notifs.filter(({ read }) => !read)
                    break
            }
            for (const notif of notifs) {
                notifsList.appendChild(Materials.createElementNotif(notif))
            }
        }
    }
    static setNotifsMessage(error) {
        if (!notifsList) return
        notifsList.innerHTML = `<div class="error-message">${error.message}</div>`
    }
    static showNotificationsBoard(show) {
        if (!notificationsBoard) return
        notificationsBoard.classList.remove('active')
        if (show) {
            notificationsBoard.classList.add('active')
        }
    }
}
NotificationsController.notifsData = []
NotificationsController.ringNotifFlag = true
NotificationsController.ringNotifTimer = null
const initLayout = () => {
    if (!notificationsBoard) return
    // setup "notifications" section
    const tabs = notificationsBoard.querySelectorAll('.notifs-content .tabs .tab-btn')
    for (const tab of tabs) {
        tab.addEventListener('click', function (e) {
            if (tab.classList.contains('active')) return
            const navigationSection = tab.closest('.navigation-section')
            const tabs = navigationSection.querySelectorAll('.tabs .tab-btn')
            for (const tab of tabs) {
                tab.classList.remove('active')
            }
            tab.classList.add('active')
            NotificationsController.setNotifs(
                tab.getAttribute('data-mmn-tab-value'),
                NotificationsController.getNotifsData(),
            )
        })
    }
}
initLayout()
