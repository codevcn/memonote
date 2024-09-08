import type { TCustomExceptionPayload } from '../types.js'

export interface IExceptionValidationService<T> {
    validateException: (exception: T) => TCustomExceptionPayload
}
