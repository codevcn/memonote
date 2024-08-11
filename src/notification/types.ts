import type { ENotificationTypes } from './enums'
import type { Notification } from './notification.model'

export type TNewNotif = {
    message: string
    type: ENotificationTypes
    createdAt: Date
}

export type TTranslationNotif = Notification & {
    translation: {
        message: string
        type: string
        createdAt: string
    }
}

export type TGetNotifsReturn = {
    notifs: TTranslationNotif[]
    isEnd: boolean
}

export type TNotifTranslation = {
    message: string
    type: string
    createdAt: string
}

export type TNotifWithTrans = Notification & {
    translation: TNotifTranslation
}
