'use strict'
class Materials {
    static createHTMLLoading(type) {
        if (type === 'grow') {
            return `
                <div class="spinner-grow spinner" role="status">
                    <span class="sr-only"></span>
                </div>`
        }
        return `
            <div class="spinner-border spinner" role="status">
                <span class="sr-only"></span>
            </div>`
    }
    static createElementNotif(notifData) {
        const notif = document.createElement('div')
        notif.classList.add('notif')
        if (notifData.isNew) {
            notif.classList.add('is-new')
        }
        let notifType = 'Remind'
        switch (notifData.type) {
            case ENotificationTypes.SET_PASSWORD:
                notifType = 'Set password'
                break
            case ENotificationTypes.REMOVE_PASSWORD:
                notifType = 'Remove password'
                break
        }
        notif.innerHTML = `
            <div class="notif-content">
                <p class="title">${notifData.message}</p>
                <div class="d-flex column-gap-2 mt-1">
                    <span class="notif-type">${notifType}</span>
                    <span class="time-ago">${calculateTimeDifference(notifData.createdAt)} ago</span>
                </div>
            </div>`
        return notif
    }
}
