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
        const translation = notifData.translation
        notif.innerHTML = `
            <div class="notif-content">
                <p class="title">${translation.message}</p>
                <div class="d-flex column-gap-2 mt-1">
                    <span class="notif-type">${translation.type}</span>
                    <span class="time-ago">${translation.createdAt} ago</span>
                </div>
            </div>`
        return notif
    }
}
