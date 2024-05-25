'use strict'
class BaseCustomError extends Error {
    constructor(message) {
        super(message)
        this.name = 'Base Custom Error'
    }
}
