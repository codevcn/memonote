const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

const clientSocketConfig = {
    autoConnect: true,
    withCredentials: true,
}

class LayoutController {
    private static readonly NOTIFICATION_TIMEOUT: number = 3000
    private static readonly GENERAL_STATUS_TIMEOUT: number = 3000
    private static toasterAnimationFlag: boolean = true
    private static toasterTimer: ReturnType<typeof setTimeout> | null = null
    private static generalAppStatusTimer: ReturnType<typeof setTimeout> | null = null

    private static readonly generalAppStatus = document.getElementById(
        'general-app-status',
    ) as HTMLElement

    static notifyNoteEdited(type: 'on' | 'off', noteForm: TNoteForm): void {
        let baseClasses: string[] = ['notify-note-edited', 'slither', 'blink']
        let notifyNoteEditedClass: string[] = ['notify-note-edited']
        notifyNoteEditedClass.push(LocalStorageController.getEditedNotifyStyle() || 'blink')
        let noteFormItem: HTMLElement
        const { title, author, content } = noteForm
        const noteFormEle = homePage_pageMain.querySelector('.note-form') as HTMLElement
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
        if (this.generalAppStatusTimer) {
            clearTimeout(this.generalAppStatusTimer)
        }
        const generalAppStatus = this.generalAppStatus
        const icons = generalAppStatus.querySelectorAll<HTMLElement>('.status-icon')
        for (const icon of icons) {
            icon.hidden = true
        }
        const icon = generalAppStatus.querySelector(`.status-icon.${status}-icon`) as HTMLElement
        icon.hidden = false
        generalAppStatus.classList.add('active')
        if (status !== 'loading') {
            this.generalAppStatusTimer = setTimeout(() => {
                generalAppStatus.classList.remove('active')
            }, this.GENERAL_STATUS_TIMEOUT)
        }
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
