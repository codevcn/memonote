const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

const generalAppStatus = document.getElementById('general-app-status') as HTMLElement
const notificationBtn = document.querySelector<HTMLElement>(
    '#nav-bar .right-side-menu .menu-item.notification .notification-btn',
)
const notificationsBoard = document.getElementById('notifs-board') // can be null
const notifsList = notificationsBoard?.querySelector<HTMLElement>('.notifs-content .notifs')
const notifsTabs = notificationsBoard?.querySelector<HTMLElement>('.notifs-content .tabs')

class LayoutController {
    private static readonly NOTIFICATION_TIMEOUT: number = 3000
    private static readonly GENERAL_STATUS_TIMEOUT: number = 3000
    private static toasterAnimationFlag: boolean = true
    static toasterTimer: ReturnType<typeof setTimeout> | null = null

    static notifyNoteEdited(type: 'on' | 'off', noteForm: TNoteForm): void {
        let baseClasses = ['notify-note-edited', 'slither', 'blink']
        let notifyNoteEditedClass: string[] = ['notify-note-edited']
        notifyNoteEditedClass.push(getEditedNotifyStyleInDevice() || 'blink')
        let noteFormItem: HTMLElement
        const { title, author, content } = noteForm
        if (title || title === '') {
            noteFormItem = noteFormEle.querySelector('.note-title') as HTMLElement
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (author || author === '') {
            noteFormItem = noteFormEle.querySelector('.note-author') as HTMLElement
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (content || content === '') {
            noteFormItem = noteFormEle.querySelector('.note-editor-board') as HTMLElement
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
    }

    static setUIOfGeneralAppStatus(status: TCommonStatus): void {
        const icons = generalAppStatus.querySelectorAll<HTMLElement>('i')
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

    static toast(
        type: 'success' | 'error' | 'info',
        message: string,
        durationInMs: number = this.NOTIFICATION_TIMEOUT,
    ): void {
        if (this.toasterTimer) {
            clearTimeout(this.toasterTimer)
        }

        const notification = document.getElementById('app-toaster') as HTMLElement
        notification.querySelector('.text-content')!.textContent = message
        notification.className = ''

        const icon = notification.querySelector('.icon-type') as HTMLElement
        if (type === 'success') {
            notification.classList.add('success')
            icon.innerHTML = '<i class="success-icon bi bi-check-circle-fill"></i>'
        } else if (type === 'error') {
            notification.classList.add('error')
            icon.innerHTML = '<i class="error-icon bi bi-x-circle-fill"></i>'
        } else {
            icon.innerHTML = '<i class="info-icon bi bi-question-circle-fill"></i>'
        }

        const progressBar = notification.querySelector('.progress-bar') as HTMLElement
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

    static closeAppToaster(target: HTMLElement): void {
        const toasterTimer = LayoutController.toasterTimer
        if (toasterTimer) {
            clearTimeout(toasterTimer)
        }
        target.classList.add('clicked')
    }

    static switchTab(target: HTMLElement, standing: string): void {
        const navigationSection = target.closest('.navigation-section') as HTMLElement

        const tabs = navigationSection.querySelectorAll<HTMLLabelElement>('.tabs .tab-btn')
        for (const tab of tabs) {
            tab.classList.remove('active')
        }
        target.classList.add('active')

        const destinations = navigationSection.querySelectorAll<HTMLElement>('.destination')
        for (const destination of destinations) {
            destination.classList.remove('active')
            if (destination.classList.contains(standing)) {
                destination.classList.add('active')
            }
        }
    }
}

class NotificationsController {
    private static notifsData: TNotif[] = []
    private static ringNotifFlag: boolean = true
    private static ringNotifTimer: ReturnType<typeof setTimeout> | null = null

    private static setNotifsData(notifsData: TNotif[]): void {
        this.notifsData = notifsData

        this.setCounter('all', notifsData.length)
        this.setCounter(
            'unread',
            notifsData.reduce((pre, notif) => (!notif.read ? pre + 1 : pre), 0),
        )
    }

    private static addNotifData(notif: TNotif): void {
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

    static getNotifsData(): TNotif[] {
        return this.notifsData
    }

    static setCounter(category: TNotifCategories, count: number): void {
        if (!notifsTabs || !notificationBtn) return

        const countInString = `${count}`

        notifsTabs.querySelector(`.tab-btn[data-mmn-tab-value='${category}'] .count`)!.textContent =
            countInString

        if (category === 'unread') {
            const badge = notificationBtn.querySelector('.icon-wrapper .badge') as HTMLElement
            if (count > 0) {
                badge.classList.add('active')
            } else {
                badge.classList.remove('active')
            }
            badge.textContent = countInString
        }
    }

    static addNotif(notif: TNotif): void {
        if (!notifsList) return
        if (this.notifsData.length === 0) {
            notifsList.innerHTML = ''
        }
        this.addNotifData(notif)
        notifsList.prepend(Materials.createElementNotif(notif))
    }

    static setNotifs(category: TNotifCategories, notifsPayload: TNotif[]): void {
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

    static setNotifsMessage(error: BaseCustomError): void {
        if (!notifsList) return
        notifsList.innerHTML = `<div class="error-message">${error.message}</div>`
    }

    static showNotificationsBoard(show: boolean): void {
        if (!notificationsBoard) return

        notificationsBoard.classList.remove('active')
        if (show) {
            notificationsBoard.classList.add('active')
        }
    }
}

const initLayout = () => {
    if (!notificationsBoard) return

    // setup "notifications" section
    const tabs = notificationsBoard.querySelectorAll<HTMLElement>('.notifs-content .tabs .tab-btn')
    for (const tab of tabs) {
        tab.addEventListener('click', function (e) {
            if (tab.classList.contains('active')) return

            const navigationSection = tab.closest('.navigation-section') as HTMLElement

            const tabs = navigationSection.querySelectorAll<HTMLElement>('.tabs .tab-btn')
            for (const tab of tabs) {
                tab.classList.remove('active')
            }
            tab.classList.add('active')

            NotificationsController.setNotifs(
                tab.getAttribute('data-mmn-tab-value') as TNotifCategories,
                NotificationsController.getNotifsData(),
            )
        })
    }
}
initLayout()
