type THTMLLoadingType = 'grow' | 'border'

class Materials {
    static createHTMLLoading(type: THTMLLoadingType): string {
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

    static createElementNotif(notifData: TNotifData): HTMLElement {
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
                    <span class="time-ago">${translation.createdAt}</span>
                </div>
            </div>`
        return notif
    }

    static createHTMLProgress(
        type: TCommonStatus,
        percent: number,
        containerClass: string = '',
    ): string {
        let statusClass: string
        if (type === 'success') {
            statusClass = 'bg-success'
        } else if (type === 'warning') {
            statusClass = 'bg-warning'
        } else {
            statusClass = 'bg-info'
        }
        return `
            <div class="progress ${containerClass}" role="progressbar">
                <div class="progress-bar ${statusClass} progress-bar-striped progress-bar-animated"
                    style="width: ${percent}%">${percent}%</div>
            </div>`
    }
}
