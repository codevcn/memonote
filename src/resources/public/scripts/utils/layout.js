'use strict'
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
const generalAppStatus = document.getElementById('general-app-status')
const closeAppNotification = (target) => {
    target.classList.add('clicked')
}
class LayoutUI {
    static setUIOfGenetalAppStatus(status) {
        if (status === 'success') {
            generalAppStatus.hidden = false
        }
    }
    static toast(type, message, durationInMs = this.DEFAULT_NOTIFICATION_TIMEOUT) {
        const notification = document.getElementById('app-notification')
        notification.querySelector('.text-content').textContent = message
        notification.classList.remove('clicked')
        const progressBar = notification.querySelector('.progress-bar')
        progressBar.style.animationDuration = durationInMs / 1000 + 's'
        notification.className = ''
        if (type === 'success') {
            notification.classList.add('show', 'success')
            notification.querySelector('.type-icon').innerHTML =
                '<i class="success-icon bi bi-check-circle-fill"></i>'
        } else if (type === 'error') {
            notification.classList.add('show', 'error')
            notification.querySelector('.type-icon').innerHTML =
                '<i class="error-icon bi bi-x-circle-fill"></i>'
        } else {
            notification.classList.add('show')
            notification.querySelector('.type-icon').innerHTML =
                '<i class="info-icon bi bi-question-circle-fill"></i>'
        }
        progressBar.classList.add('running')
        setTimeout(() => {
            progressBar.classList.remove('running')
            notification.className = ''
        }, durationInMs)
    }
}
LayoutUI.DEFAULT_NOTIFICATION_TIMEOUT = 3000
