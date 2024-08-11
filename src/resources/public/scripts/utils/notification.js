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
var _a, _b, _c, _d
var _e
// init types, enums, ...
var ENotificationEvents
;(function (ENotificationEvents) {
    ENotificationEvents['NOTIFY'] = 'notify'
})(ENotificationEvents || (ENotificationEvents = {}))
// init socket
const notificationSocket = io(`/${ENamespacesOfSocket.NOTIFICATION}`, clientSocketConfig)
// init vars
const notificationSocketReconnecting = { flag: false }
// listeners
notificationSocket.on(EInitSocketEvents.CLIENT_CONNECTED, (data) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (notificationSocketReconnecting.flag) {
            LayoutController.toast('success', 'Connected to server.', 2000)
            notificationSocketReconnecting.flag = false
        }
        console.log('>>> Socket connected to server.')
    }),
)
notificationSocket.on(EInitSocketEvents.CONNECT_ERROR, (err) =>
    __awaiter(void 0, void 0, void 0, function* () {
        if (notificationSocket.active) {
            LayoutController.toast('info', 'Trying to connect with the server.', 2000)
            notificationSocketReconnecting.flag = true
        } else {
            LayoutController.toast('error', "Can't connect with the server.")
            console.error(`>>> connect_error due to ${err.message}`)
        }
    }),
)
notificationSocket.on(ENotificationEvents.NOTIFY, (notif) =>
    __awaiter(void 0, void 0, void 0, function* () {
        NotificationsController.addNewNotif(
            Object.assign(Object.assign({}, notif), { isNew: true }),
        )
    }),
)
// controller
class NotificationsController {
    static setNotifsData(notifsData) {
        this.notifsData = notifsData
    }
    static addNotifsData(notifs) {
        this.notifsData.push(...notifs)
        this.newNotifsData.push(...notifs)
    }
    static unshiftNotifData(notif) {
        this.notifsData.unshift(notif)
        this.newNotifsData.unshift(notif)
    }
    static ringNotification() {
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
    static setCounter(category, count) {
        const notifsTabs = this.notifsTabs
        const notificationBtn = this.notificationBtn
        if (!notifsTabs || !notificationBtn) return
        const countInString = `${count}`
        notifsTabs.querySelector(`.nav-tab[data-mmn-tab-value='${category}'] .count`).textContent =
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
    static addNewNotif(notif) {
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
    static renderNotifs(notifsPayload) {
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
    static setNotifsMessage(message) {
        const notifsList = this.notifsList_all
        if (!notifsList) return
        notifsList.innerHTML = `<div class="error-message">${message}</div>`
    }
    static showNotificationsBoard(show) {
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
    static setLoadMoreBtn(type, data) {
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
                loadMoreBtn.innerHTML = data
                break
            case 'show':
                loadMoreBtn.classList.add('active')
                break
            case 'hide':
                loadMoreBtn.classList.remove('active')
                break
        }
    }
    static loadMoreNotifs() {
        var _a
        return __awaiter(this, void 0, void 0, function* () {
            const notifsList = this.notifsList_all
            if (!notifsList) return
            let apiResult = null
            const htmlBefore =
                ((_a = this.loadMoreBtn) === null || _a === void 0 ? void 0 : _a.innerHTML) || ''
            this.setLoadMoreBtn('innerHtml', Materials.createHTMLLoading('border'))
            try {
                const { data } = yield getNotificationsAPI(
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
            if (apiResult && apiResult.notifs && apiResult.notifs.length > 0) {
                const notifs = apiResult.notifs.map((notif) =>
                    Object.assign(Object.assign({}, notif), { isNew: false }),
                )
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
        })
    }
    static fetchNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            const notifsList = this.notifsList_all
            if (!notifsList) return
            const htmlBefore = notifsList.innerHTML
            notifsList.innerHTML = Materials.createHTMLLoading('border')
            let apiSuccess = false
            let apiResult = null
            try {
                const { data } = yield getNotificationsAPI(pageData.noteId)
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
                        apiResult.notifs.map((notif) =>
                            Object.assign(Object.assign({}, notif), { isNew: false }),
                        ),
                    )
                    if (apiResult.isEnd) {
                        this.setLoadMoreBtn('hide')
                    } else {
                        this.setLoadMoreBtn('show')
                    }
                } else {
                    notifsList.innerHTML = htmlBefore
                }
            }
        })
    }
    static initCategorySwitcher() {
        const notificationsBoard = this.notificationsBoard
        if (!notificationsBoard) return
        const tabs = notificationsBoard.querySelectorAll('.notifs-content .nav-tabs-list .nav-tab')
        for (const tab of tabs) {
            tab.addEventListener('click', function (e) {
                LayoutController.tabNavigator(tab)
            })
        }
    }
}
_e = NotificationsController
NotificationsController.notifsData = []
NotificationsController.newNotifsData = []
NotificationsController.ringNotifFlag = true
NotificationsController.notificationBtn = document.querySelector(
    '#nav-bar .right-side-menu .menu-item.notification .notification-btn',
)
NotificationsController.notificationsBoard = document.getElementById('notifs-board') // could be null
NotificationsController.notifsList_all =
    (_a = _e.notificationsBoard) === null || _a === void 0
        ? void 0
        : _a.querySelector('.notifs-scroller.all .notifs')
NotificationsController.notifsList_isNew =
    (_b = _e.notificationsBoard) === null || _b === void 0
        ? void 0
        : _b.querySelector('.notifs-scroller.is-new .notifs')
NotificationsController.notifsTabs =
    (_c = _e.notificationsBoard) === null || _c === void 0
        ? void 0
        : _c.querySelector('.nav-tabs-list')
NotificationsController.loadMoreBtn =
    (_d = _e.notificationsBoard) === null || _d === void 0
        ? void 0
        : _d.querySelector('.load-more-btn')
const initNotification = () => {
    NotificationsController.initCategorySwitcher()
    NotificationsController.fetchNotifications()
}
initNotification()
