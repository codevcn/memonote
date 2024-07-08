import type { ENotificationTypes } from './enums'

export type TNewNotif = {
    message: string
    read: boolean
    type: ENotificationTypes
    createdAt: Date
}
