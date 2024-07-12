const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

class LayoutController {
    private static readonly NOTIFICATION_TIMEOUT: number = 3000
    private static readonly GENERAL_STATUS_TIMEOUT: number = 3000
    private static toasterAnimationFlag: boolean = true
    private static toasterTimer: ReturnType<typeof setTimeout> | null = null
    private static generalAppStatus = document.getElementById('general-app-status') as HTMLElement

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
        const generalAppStatus = this.generalAppStatus
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

    /**
     * Switch tab handler - click on a tab then switch to a form or a section
     * @param target tab button used to switch between forms or sections
     * @param tabDataAttrName full name of "data-" attribute for tab clicked on
     */
    static tabNavigator(
        target: HTMLElement,
        tabDataAttrName?: string,
        desDataAttrName?: string,
    ): void {
        if (target.classList.contains('active')) return

        const navigationSection = target.closest('.tab-navigator') as HTMLElement
        const navTabsList = target.closest('.nav-tabs-list') as HTMLElement

        const tabs = navTabsList.querySelectorAll<HTMLLabelElement>('.nav-tab')
        for (const tab of tabs) {
            tab.classList.remove('active')
        }
        target.classList.add('active')

        const classesSwitchTo = target
            .getAttribute(tabDataAttrName || 'data-mmn-tab-value')!
            .split(' ')
        const desClass = navTabsList.getAttribute(desDataAttrName || 'data-mmn-destination-class')

        const destinations = navigationSection.querySelectorAll<HTMLElement>(
            `.nav-destination${
                desClass && desClass.length > 0 ? `.${desClass.split(' ').join('.')}` : ''
            }`,
        )
        for (const des of destinations) {
            des.classList.remove('active')
            if (classesSwitchTo.every((className) => des.classList.contains(className))) {
                des.classList.add('active')
            }
        }
    }
}

type TNotifData = TNotif & {
    isNew: boolean
}

type TNotifCategory = 'all' | 'is-new'

class NotificationsController {
    private static notifsData: TNotifData[] = []
    private static newNotifsData: TNotifData[] = []
    private static ringNotifFlag: boolean = true
    private static startingTimestamp: Date = new Date()

    private static notificationBtn = document.querySelector<HTMLElement>(
        '#nav-bar .right-side-menu .menu-item.notification .notification-btn',
    )
    private static notificationsBoard = document.getElementById('notifs-board') // could be null
    private static notifsList_all = this.notificationsBoard?.querySelector<HTMLElement>(
        '.notifs-scroller.all .notifs',
    )
    private static notifsList_isNew = this.notificationsBoard?.querySelector<HTMLElement>(
        '.notifs-scroller.is-new .notifs',
    )
    private static notifsTabs =
        this.notificationsBoard?.querySelector<HTMLElement>('.nav-tabs-list')
    private static loadMoreBtn =
        this.notificationsBoard?.querySelector<HTMLElement>('.load-more-btn')

    private static setNotifsData(notifsData: TNotifData[]): void {
        this.notifsData = notifsData
    }

    private static addNotifsData(notifs: TNotifData[]): void {
        this.notifsData.push(...notifs)
        this.newNotifsData.push(...notifs)
    }

    private static unshiftNotifData(notif: TNotifData): void {
        this.notifsData.unshift(notif)
        this.newNotifsData.unshift(notif)
    }

    private static ringNotification(): void {
        const notificationBtn = this.notificationBtn
        if (!notificationBtn) return

        notificationBtn.classList.remove('on-ring-a', 'on-ring-b')
        if (this.ringNotifFlag) {
            notificationBtn.classList.add('on-ring-a')
            this.ringNotifFlag = false
        } else {
            notificationBtn.classList.add('on-ring-b')
            this.ringNotifFlag = true
        }
    }

    static setCounter(category: TNotifCategory, count: number): void {
        const notifsTabs = this.notifsTabs
        const notificationBtn = this.notificationBtn
        if (!notifsTabs || !notificationBtn) return

        const countInString = `${count}`

        notifsTabs.querySelector(`.nav-tab[data-mmn-tab-value='${category}'] .count`)!.textContent =
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

    static addNewNotif(notif: TNotifData): void {
        const notifsList_all = this.notifsList_all
        const notifsList_isNew = this.notifsList_isNew
        if (!notifsList_all || !notifsList_isNew) return

        if (this.notifsData.length === 0) {
            notifsList_all.innerHTML = ''
        }
        if (this.newNotifsData.length === 0) {
            notifsList_isNew.innerHTML = ''
        }
        this.unshiftNotifData(notif)
        const newNotif = Materials.createElementNotif(notif)
        notifsList_all.prepend(newNotif)
        notifsList_isNew.prepend(newNotif.cloneNode(true))
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

    static renderNotifs(category: TNotifCategory, notifsPayload: TNotifData[]): void {
        const notifsList = this.notifsList_all
        if (notifsList && notifsPayload && notifsPayload.length > 0) {
            notifsList.innerHTML = ''
            this.setNotifsData(notifsPayload)
            this.setCounter('all', notifsPayload.length)
            for (const notif of notifsPayload) {
                notifsList.appendChild(Materials.createElementNotif(notif))
            }
        }
    }

    static setNotifsMessage(message: string): void {
        const notifsList = this.notifsList_all
        if (!notifsList) return

        notifsList.innerHTML = `<div class="error-message">${message}</div>`
    }

    static showNotificationsBoard(show: boolean): void {
        if (!this.notificationsBoard) return

        const notificationsBoard = this.notificationsBoard
        if (show) {
            document.body.style.overflow = 'hidden'
            notificationsBoard.classList.add('active')
        } else {
            document.body.style.overflow = 'initial'
            notificationsBoard.classList.remove('active')
        }
    }

    static setLoadMoreBtn(
        type: 'error' | 'message' | 'innerHtml' | 'hide' | 'show',
        data?: string,
    ): void {
        const loadMoreBtn = this.loadMoreBtn
        if (!loadMoreBtn) return

        loadMoreBtn.classList.remove('error', 'info')
        switch (type) {
            case 'error':
                loadMoreBtn.classList.add('error')
                loadMoreBtn.innerHTML = `<span>${data}</span>`
                break
            case 'message':
                loadMoreBtn.classList.add('info')
                loadMoreBtn.innerHTML = `<span>${data}</span>`
                break
            case 'innerHtml':
                loadMoreBtn.innerHTML = data!
                break
            case 'show':
                loadMoreBtn.classList.add('active')
                break
            case 'hide':
                loadMoreBtn.classList.remove('active')
                break
        }
    }

    static async loadMoreNotifs(): Promise<void> {
        const notifsList = this.notifsList_all
        if (!notifsList) return

        let apiResult: TGetNotifications | null = null
        const htmlBefore = this.loadMoreBtn?.innerHTML || ''
        this.setLoadMoreBtn('innerHtml', Materials.createHTMLLoading('border'))
        try {
            const { data } = await getNotificationsAPI(
                pageData.noteId,
                this.notifsData[this.notifsData.length - 1],
            )
            apiResult = data
        } catch (error) {
            if (error instanceof Error) {
                this.setLoadMoreBtn('error', error.message)
                throw new BaseCustomError(error.message)
            }
        }
        this.setLoadMoreBtn('innerHtml', htmlBefore)
        if (apiResult && apiResult.notifs.length > 0) {
            const notifs = apiResult.notifs
                .map((notif) => ({ ...notif, isNew: false }))
                .filter(({ createdAt }) => dayjs(createdAt).isBefore(this.startingTimestamp))
            this.addNotifsData(notifs)
            for (const notif of notifs) {
                notifsList.appendChild(Materials.createElementNotif(notif))
            }
            this.setCounter('all', this.notifsData.length)
            if (apiResult.isEnd) {
                this.setLoadMoreBtn('hide')
            }
        } else {
            this.setLoadMoreBtn('hide')
        }
    }

    static async fetchNotifications(): Promise<void> {
        const notifsList = this.notifsList_all
        if (!notifsList) return

        const htmlBefore = notifsList.innerHTML
        notifsList.innerHTML = Materials.createHTMLLoading('border')

        let apiSuccess: boolean = false
        let apiResult: TGetNotifications | null = null
        try {
            const { data } = await getNotificationsAPI(pageData.noteId)
            apiResult = data
            apiSuccess = true
        } catch (error) {
            if (error instanceof Error) {
                const err = HTTPErrorHandler.handleError(error)
                this.setNotifsMessage(err.message)
            }
        }
        if (apiSuccess) {
            if (apiResult && apiResult.notifs.length > 0) {
                this.renderNotifs(
                    'all',
                    apiResult.notifs.map((notif) => ({ ...notif, isNew: false })),
                )
                this.setLoadMoreBtn('show')
            } else {
                notifsList.innerHTML = htmlBefore
            }
        }
    }

    static initCategorySwitcher(): void {
        const notificationsBoard = this.notificationsBoard
        if (!notificationsBoard) return

        const tabs = notificationsBoard.querySelectorAll<HTMLElement>(
            '.notifs-content .nav-tabs-list .nav-tab',
        )
        for (const tab of tabs) {
            tab.addEventListener('click', function (e) {
                LayoutController.tabNavigator(tab)
            })
        }
    }
}

const initLayout = () => {
    NotificationsController.initCategorySwitcher()
    NotificationsController.fetchNotifications()
}
initLayout()
