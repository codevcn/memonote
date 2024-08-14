'use strict'
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
const clientSocketConfig = {
    autoConnect: true,
    withCredentials: true,
}
class LayoutController {
    static notifyNoteEdited(type, noteForm) {
        let baseClasses = ['notify-note-edited', 'slither', 'blink']
        let notifyNoteEditedClass = ['notify-note-edited']
        notifyNoteEditedClass.push(LocalStorageController.getEditedNotifyStyle() || 'blink')
        let noteFormItem
        const { title, author, content } = noteForm
        const noteFormEle = homePage_pageMain.querySelector('.note-form')
        if (title || title === '') {
            noteFormItem = noteFormEle.querySelector('.note-title')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (author || author === '') {
            noteFormItem = noteFormEle.querySelector('.note-author')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
        if (content || content === '') {
            noteFormItem = noteFormEle.querySelector('.note-editor-board')
            noteFormItem.classList.remove(...baseClasses)
            if (type === 'on') {
                noteFormItem.classList.add(...notifyNoteEditedClass)
            }
        }
    }
    static setUIOfGeneralAppStatus(status) {
        if (this.generalAppStatusTimer) {
            clearTimeout(this.generalAppStatusTimer)
        }
        const generalAppStatus = this.generalAppStatus
        const icons = generalAppStatus.querySelectorAll('.status-icon')
        for (const icon of icons) {
            icon.hidden = true
        }
        const icon = generalAppStatus.querySelector(`.status-icon.${status}-icon`)
        icon.hidden = false
        generalAppStatus.classList.add('active')
        if (status !== 'loading') {
            this.generalAppStatusTimer = setTimeout(() => {
                generalAppStatus.classList.remove('active')
            }, this.GENERAL_STATUS_TIMEOUT)
        }
    }
    static toast(type, message, durationInMs = this.NOTIFICATION_TIMEOUT) {
        if (this.toasterTimer) {
            clearTimeout(this.toasterTimer)
        }
        const notification = document.getElementById('app-toaster')
        notification.querySelector('.text-content').textContent = message
        notification.className = ''
        const icon = notification.querySelector('.icon-type')
        if (type === 'success') {
            notification.classList.add('success')
            icon.innerHTML = '<i class="success-icon bi bi-check-circle-fill"></i>'
        } else if (type === 'error') {
            notification.classList.add('error')
            icon.innerHTML = '<i class="error-icon bi bi-x-circle-fill"></i>'
        } else {
            icon.innerHTML = '<i class="info-icon bi bi-question-circle-fill"></i>'
        }
        const progressBar = notification.querySelector('.progress-bar')
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
    static closeAppToaster(target) {
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
    static tabNavigator(target, tabDataAttrName, desDataAttrName) {
        if (target.classList.contains('active')) return
        const navigationSection = target.closest('.tab-navigator')
        const navTabsList = target.closest('.nav-tabs-list')
        const tabs = navTabsList.querySelectorAll('.nav-tab')
        for (const tab of tabs) {
            tab.classList.remove('active')
        }
        target.classList.add('active')
        const classesSwitchTo = target
            .getAttribute(tabDataAttrName || 'data-mmn-tab-value')
            .split(' ')
        const desClass = navTabsList.getAttribute(desDataAttrName || 'data-mmn-destination-class')
        const destinations = navigationSection.querySelectorAll(
            `.nav-destination${desClass && desClass.length > 0 ? `.${desClass.split(' ').join('.')}` : ''}`,
        )
        for (const des of destinations) {
            des.classList.remove('active')
            if (classesSwitchTo.every((className) => des.classList.contains(className))) {
                des.classList.add('active')
            }
        }
    }
}
LayoutController.NOTIFICATION_TIMEOUT = 3000
LayoutController.GENERAL_STATUS_TIMEOUT = 3000
LayoutController.toasterAnimationFlag = true
LayoutController.toasterTimer = null
LayoutController.generalAppStatusTimer = null
LayoutController.generalAppStatus = document.getElementById('general-app-status')
