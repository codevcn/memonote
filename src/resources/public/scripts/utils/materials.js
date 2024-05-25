'use strict'
const getHTMLLoading = (type) => {
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
