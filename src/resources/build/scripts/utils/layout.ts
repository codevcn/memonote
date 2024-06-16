const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

const generalAppStatus = document.getElementById('general-app-status') as HTMLElement

const closeAppNotification = (target: HTMLElement) => {
    target.classList.add('clicked')
}

class LayoutUI {
    private static readonly DEFAULT_NOTIFICATION_TIMEOUT = 3000

    public static setUIOfGenetalAppStatus(status: TCommonStatus): void {
        if (status === 'success') {
            generalAppStatus.hidden = false
        }
    }

    public static toast(
        type: 'success' | 'error' | 'info',
        message: string,
        durationInMs: number = this.DEFAULT_NOTIFICATION_TIMEOUT,
    ): void {
        const notification = document.getElementById('app-notification') as HTMLElement
        notification.querySelector('.text-content')!.textContent = message
        notification.classList.remove('clicked')

        const progressBar = notification.querySelector('.progress-bar') as HTMLElement
        progressBar.style.animationDuration = durationInMs / 1000 + 's'

        notification.className = ''
        if (type === 'success') {
            notification.classList.add('show', 'success')
            notification.querySelector('.type-icon')!.innerHTML =
                '<i class="success-icon bi bi-check-circle-fill"></i>'
        } else if (type === 'error') {
            notification.classList.add('show', 'error')
            notification.querySelector('.type-icon')!.innerHTML =
                '<i class="error-icon bi bi-x-circle-fill"></i>'
        } else {
            notification.classList.add('show')
            notification.querySelector('.type-icon')!.innerHTML =
                '<i class="info-icon bi bi-question-circle-fill"></i>'
        }

        progressBar.classList.add('running')

        setTimeout(() => {
            progressBar.classList.remove('running')
            notification.className = ''
        }, durationInMs)
    }
}
