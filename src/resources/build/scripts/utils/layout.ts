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

type TSetLoadMoreStatus = {
    message?: string
    show?: 'on' | 'off'
    error?: Error
}

class NotificationsController {
    private static notifsData: TNotifData[] = []
    private static ringNotifFlag: boolean = true
    private static ringNotifTimer: ReturnType<typeof setTimeout> | null = null
    private static page: number = 1

    private static setNotifsData(notifsData: TNotifData[]): void {
        this.notifsData = notifsData
    }

    private static addNotifsData(notifs: TNotifData[]): void {
        this.notifsData.unshift(...notifs)
    }

    private static ringNotification(): void {
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

    static getNotifsData(): TNotifData[] {
        return this.notifsData
    }

    static setCounter(category: TNotifCategories, count: number): void {
        if (!notifsTabs || !notificationBtn) return

        const countInString = `${count}`

        notifsTabs.querySelector(`.tab-btn[data-mmn-tab-value='${category}'] .count`)!.textContent =
            countInString

        if (category === 'is-new') {
            const badge = notificationBtn.querySelector('.icon-wrapper .badge') as HTMLElement
            if (count > 0) {
                badge.classList.add('active')
            } else {
                badge.classList.remove('active')
            }
            badge.textContent = countInString
        }
    }

    static addNotifs(notifs: TNotifData[]): void {
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

    static setNotifs(category: TNotifCategories, notifsPayload: TNotifData[]): void {
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

    static setScrollingSentinel(data: TSetLoadMoreStatus): void {
        const notifScrollingSentinel = document.getElementById(
            'notification-scrolling-sentinel',
        ) as HTMLElement

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

    static async loadMoreNotifs(): Promise<void> {
        if (!notifsList) return
        let apiResult: TNotif[] = []
        let apiSuccess: boolean = false
        this.setScrollingSentinel({ show: 'on' })
        try {
            const { data } = await getNotificationsAPI(pageData.noteId, this.page + 1)
            apiResult = data
            apiSuccess = true
        } catch (error) {
            LayoutController.toast('error', 'Cannot load more notifications')
            this.setScrollingSentinel({ error: error as Error })
        }
        if (apiSuccess) {
            if (apiResult && apiResult.length > 0) {
                const notifs = apiResult.map((notif) => ({ ...notif, isNew: false }))
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
    }

    static setupInfiniteScrolling(): void {
        if (!notificationsBoard) return
        const notifScrollingSentinel = document.getElementById(
            'notification-scrolling-sentinel',
        ) as HTMLElement
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting) {
                    observer.unobserve(notifScrollingSentinel) // pause to avoid calling API too many times
                    try {
                        await this.loadMoreNotifs()
                    } catch (error) {
                        return
                    }
                    observer.observe(notifScrollingSentinel) // keep observing
                }
            },
            {
                root: notificationsBoard.querySelector('.notifs-scroller') as HTMLElement,
                rootMargin: '0px',
                threshold: 1.0,
            },
        )
        observer.observe(notifScrollingSentinel) // start observing
    }
}

const initLayout = () => {
    if (!notificationsBoard) return

    // setup "swicth notification category" section
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
