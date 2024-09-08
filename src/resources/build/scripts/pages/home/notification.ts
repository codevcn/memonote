enum ENotificationEvents {
    NOTIFY = 'notify',
}
type TNotifCategory = 'all' | 'is-new'

class NotificationSocket {
    private readonly socket: any
    private readonly reconnecting: TSocketReconnecting

    constructor() {
        this.socket = io(
            `/${ENamespacesOfSocket.NOTIFICATION}`,
            initClientSocketConfig(getNoteUniqueNameFromURL(), pageData.noteId),
        )
        this.reconnecting = { flag: false }
        this.listenConnected()
        this.listenConnectionError()
        this.listenNotify()
    }

    private async listenConnected(): Promise<void> {
        this.socket.on(EInitSocketEvents.CLIENT_CONNECTED, (data: TClientConnectedEventPld) => {
            if (this.reconnecting.flag) {
                LayoutController.toast('success', 'Connected to server.', 2000)
                this.reconnecting.flag = false
            }
            console.log('>>> normal Editor Socket connected to server.')
        })
    }

    private async listenConnectionError(): Promise<void> {
        this.socket.on(EInitSocketEvents.CONNECT_ERROR, (err: Error) => {
            if (this.socket.active) {
                LayoutController.toast('info', 'Trying to connect with the server.', 2000)
                this.reconnecting.flag = true
            } else {
                LayoutController.toast('error', "Can't connect with the server.")
                console.error(`>>> Notification connect_error due to >>> ${err.message}`)
            }
        })
    }

    emitWithoutTimeout<T>(
        event: ENotificationEvents,
        payload: T,
        cb: TUnknownFunction<void>,
    ): void {
        this.socket.emit(event, payload, cb)
    }

    emitWithTimeout<T>(
        event: ENotificationEvents,
        payload: T,
        cb: TUnknownFunction<void>,
        timeout: number,
    ) {
        this.socket.timeout(timeout).emit(event, payload, cb)
    }

    async listenNotify(): Promise<void> {
        this.socket.on(ENotificationEvents.NOTIFY, (notif: TNotifData) => {
            NotificationsController.addNewNotif({ ...notif, isNew: true })
        })
    }
}
const notificationSocket = new NotificationSocket()

// controller
class NotificationsController {
    private static notifsData: TNotifData[] = []
    private static newNotifsData: TNotifData[] = []
    private static ringNotifFlag: boolean = true

    private static readonly notificationBtn = document.querySelector<HTMLElement>(
        '#nav-bar .right-side-menu .menu-item.notification .notification-btn',
    )
    private static readonly notificationsBoard = document.getElementById('notifs-board') // could be null
    private static readonly notifsList_all = this.notificationsBoard?.querySelector<HTMLElement>(
        '.notifs-scroller.all .notifs',
    )
    private static readonly notifsList_isNew = this.notificationsBoard?.querySelector<HTMLElement>(
        '.notifs-scroller.is-new .notifs',
    )
    private static readonly notifsTabs =
        this.notificationsBoard?.querySelector<HTMLElement>('.nav-tabs-list')
    private static readonly loadMoreBtn =
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

    static renderNotifs(notifsPayload: TNotifData[]): void {
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
            const { data } = await getNotificationsAPI(this.notifsData[this.notifsData.length - 1])
            apiResult = data
        } catch (error) {
            if (error instanceof Error) {
                this.setLoadMoreBtn('error', error.message)
                throw new BaseCustomError(error.message)
            }
        }
        this.setLoadMoreBtn('innerHtml', htmlBefore)
        if (apiResult && apiResult.notifs && apiResult.notifs.length > 0) {
            const notifs = apiResult.notifs.map((notif) => ({ ...notif, isNew: false }))
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
            const { data } = await getNotificationsAPI()
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
                this.renderNotifs(apiResult.notifs.map((notif) => ({ ...notif, isNew: false })))
                if (apiResult.isEnd) {
                    this.setLoadMoreBtn('hide')
                } else {
                    this.setLoadMoreBtn('show')
                }
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

const initNotification = () => {
    NotificationsController.initCategorySwitcher()
    NotificationsController.fetchNotifications()
}
initNotification()
