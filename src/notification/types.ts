import type { ENotificationTypes } from './enums'

export type TNewNotif = {
    message: string
    type: ENotificationTypes
    createdAt: Date
}
