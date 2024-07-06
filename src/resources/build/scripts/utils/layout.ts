const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

const generalAppStatus = document.getElementById('general-app-status') as HTMLElement
const notificationsBoard = document.getElementById('notifs-board') // maybe null

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
    static addNotifs(notifPayloads: TNotif[], clearAllBeforeAdd: boolean = false): void {
        if (notificationsBoard) {
            const notifsContainer = notificationsBoard.querySelector(
                '.notifs-content .notifs',
            ) as HTMLElement
            if (clearAllBeforeAdd) {
                notifsContainer.innerHTML = ''
            }
            for (const notifPayload of notifPayloads) {
                notifsContainer.appendChild(Materials.createElementNotif(notifPayload))
            }
        }
    }

    static showNotificationsBoard(show: boolean): void {
        if (notificationsBoard) {
            notificationsBoard.classList.remove('active')
            if (show) {
                notificationsBoard.classList.add('active')
            }
        }
    }
}

const initLayout = (): void => {
    // setup "notification" section
    const notification = document.querySelector<HTMLElement>('#nav-bar .notification')
    if (notification) {
        const tabs = notification.querySelectorAll<HTMLElement>('#notifs-board .tabs .tab-btn')
        for (const tab of tabs) {
            tab.addEventListener('click', function (e) {
                LayoutController.switchTab(tab, tab.getAttribute('data-mmn-tab-value') as string)
            })
        }
    }
}
initLayout()
