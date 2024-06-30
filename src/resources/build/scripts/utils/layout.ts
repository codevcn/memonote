const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

const generalAppStatus = document.getElementById('general-app-status') as HTMLElement

const closeAppNotification = (target: HTMLElement) => {
    const toasterTimer = LayoutUI.toasterTimer
    if (toasterTimer) {
        clearTimeout(toasterTimer)
    }
    target.classList.add('clicked')
}

class LayoutUI {
    private static readonly NOTIFICATION_TIMEOUT: number = 3000
    private static readonly GENERAL_STATUS_TIMEOUT: number = 2000
    static toasterTimer: ReturnType<typeof setTimeout> | null = null
    private static toasterAnimationFlag: boolean = true

    public static setUIOfGeneralAppStatus(status: TCommonStatus): void {
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

    public static toast(
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

        LayoutUI.toasterTimer = setTimeout(() => {
            progressBar.classList.remove('running-a', 'running-b')
        }, durationInMs)
    }
}
