import type { ENotificationTypes } from './enums'
import type { Notification } from './notification.model'

export type TNewNotif = {
    message: string
    type: ENotificationTypes
    createdAt: Date
}

export type TGetNotifsReturn = {
    notifs: Notification[]
    total: number
}
