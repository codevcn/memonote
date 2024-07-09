'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next())
        })
    }
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
    }
    static addNotifsData(notifs) {
        this.notifsData.unshift(...notifs)
    }
    static ringNotification() {
        if (!notifsList || !notificationBtn) return
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
        if (category === 'is-new') {
            const badge = notificationBtn.querySelector('.icon-wrapper .badge')
            if (count > 0) {
                badge.classList.add('active')
            } else {
                badge.classList.remove('active')
            }
            badge.textContent = countInString
        }
    }
    static addNotifs(notifs) {
        if (!notifsList || !notificationBtn) return
        if (this.notifsData.length === 0) {
            notifsList.innerHTML = ''
        }
        this.addNotifsData(notifs)
        for (const notif of notifs) {
            notifsList.prepend(Materials.createElementNotif(notif))
        }
        this.setCounter('all', this.notifsData.length)
        this.setCounter(
            'is-new',
            this.notifsData.reduce(
                (preValue, notifData) => (notifData.isNew ? preValue + 1 : preValue),
                0,
            ),
        )
        this.ringNotification()
    }
    static setNotifs(category, notifsPayload) {
        if (!notificationsBoard || !notifsList) return
        notifsList.innerHTML = ''
        this.setNotifsData(notifsPayload)
        this.setCounter('all', notifsPayload.length)
        let notifs = notifsPayload
        switch (category) {
            case 'is-new':
                notifs = notifs.filter(({ isNew }) => isNew)
                break
        }
        for (const notif of notifs) {
            notifsList.appendChild(Materials.createElementNotif(notif))
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
    static setScrollingSentinel(data) {
        const notifScrollingSentinel = document.getElementById('notification-scrolling-sentinel')
        if (data.error) {
            notifScrollingSentinel.classList.add('error')
            notifScrollingSentinel.innerHTML = `
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>${data.message}</span>`
        } else if (data.message) {
            notifScrollingSentinel.classList.add('info')
            notifScrollingSentinel.innerHTML = `<span>${data}</span>`
        } else if (data.show) {
            notifScrollingSentinel.classList.remove('active')
            if (data.show === 'on') {
                notifScrollingSentinel.classList.add('active')
            }
        }
    }
    static loadMoreNotifs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!notifsList) return
            let apiResult = []
            let apiSuccess = false
            this.setScrollingSentinel({ show: 'on' })
            try {
                const { data } = yield getNotificationsAPI(pageData.noteId, this.page + 1)
                apiResult = data
                apiSuccess = true
            } catch (error) {
                LayoutController.toast('error', 'Cannot load more notifications')
                this.setScrollingSentinel({ error: error })
            }
            if (apiSuccess) {
                if (apiResult && apiResult.length > 0) {
                    const notifs = apiResult.map((notif) =>
                        Object.assign(Object.assign({}, notif), { isNew: false }),
                    )
                    this.addNotifsData(notifs)
                    for (const notif of notifs) {
                        notifsList.appendChild(Materials.createElementNotif(notif))
                    }
                    this.setCounter('all', this.notifsData.length)
                    this.page++
                    this.setScrollingSentinel({ show: 'off' })
                } else {
                    this.setScrollingSentinel({ message: 'No more notifications.' })
                    throw new BaseCustomError('Stop infinite scrolling')
                }
            }
        })
    }
    static setupInfiniteScrolling() {
        if (!notificationsBoard) return
        const notifScrollingSentinel = document.getElementById('notification-scrolling-sentinel')
        const observer = new IntersectionObserver(
            (entries) =>
                __awaiter(this, void 0, void 0, function* () {
                    if (entries[0].isIntersecting) {
                        observer.unobserve(notifScrollingSentinel) // pause to avoid calling API too many times
                        try {
                            yield this.loadMoreNotifs()
                        } catch (error) {
                            return
                        }
                        observer.observe(notifScrollingSentinel) // keep observing
                    }
                }),
            {
                root: notificationsBoard.querySelector('.notifs-scroller'),
                rootMargin: '0px',
                threshold: 1.0,
            },
        )
        observer.observe(notifScrollingSentinel) // start observing
    }
}
NotificationsController.notifsData = []
NotificationsController.ringNotifFlag = true
NotificationsController.ringNotifTimer = null
NotificationsController.page = 1
const initLayout = () => {
    if (!notificationsBoard) return
    // setup "swicth notification category" section
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
