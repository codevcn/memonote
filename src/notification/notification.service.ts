import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import {
    Notification,
    TNotificationDocument,
    TNotificationModel,
} from '@/notification/notification.model'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BaseCustomEvent } from '@/note/gateway/events'
import { EEventEmitterEvents } from './gateway/enums'
import type { TGetNotifsReturn, TGetNotifTranslationReturn, TNewNotif } from './types'
import { EDBMessages } from '@/utils/messages'
import { EEngNotifMessages, ENotificationTypes, EPagination, EViNotifMessages } from './enums'
import type { LastNotificationDTO } from './DTOs'
import { ELangCodes } from '@/lang/enums'

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: TNotificationModel,
        private eventEmitter: EventEmitter2,
    ) {}

    async findNotifs(noteId: string, limit: number, createdAt?: Date): Promise<Notification[]> {
        const notifications = await this.notificationModel
            .find({
                $and: [
                    { note: new Types.ObjectId(noteId) },
                    createdAt ? { createdAt: { $lt: new Date(createdAt) } } : {},
                ],
            })
            .sort({ createdAt: 'desc' })
            .limit(limit)
            .lean()
        return notifications
    }

    async createNewNotif(noteId: string, notif: TNewNotif): Promise<TNotificationDocument> {
        const newNotification = new this.notificationModel()
        newNotification.note = new Types.ObjectId(noteId)
        newNotification.message = notif.message
        newNotification.type = notif.type
        return await newNotification.save()
    }

    async createNewNotifHandler(
        noteId: string,
        noteUniqueName: string,
        notif: TNewNotif,
    ): Promise<void> {
        const newNotif = await this.createNewNotif(noteId, notif)
        this.eventEmitter.emit(
            EEventEmitterEvents.TRIGGER_NOTIFY,
            new BaseCustomEvent<TNotificationDocument>(newNotif, noteUniqueName),
        )
    }

    getNotifTranslation(notif: Notification, lang: ELangCodes): TGetNotifTranslationReturn {
        const notifType = notif.type
        if (lang === ELangCodes.VI) {
            switch (notifType) {
                case ENotificationTypes.REMOVE_PASSWORD:
                    return { message: EViNotifMessages.REMOVE_PASSWORD }
                case ENotificationTypes.SET_PASSWORD:
                    return { message: EViNotifMessages.SET_PASSWORD }
            }
        } else {
            switch (notifType) {
                case ENotificationTypes.REMOVE_PASSWORD:
                    return { message: EEngNotifMessages.REMOVE_PASSWORD }
                case ENotificationTypes.SET_PASSWORD:
                    return { message: EEngNotifMessages.SET_PASSWORD }
            }
        }
    }

    async fetchNotificationsHandler(
        noteId: string,
        lastNotif: LastNotificationDTO,
        lang: ELangCodes,
    ): Promise<TGetNotifsReturn> {
        if (!Types.ObjectId.isValid(noteId)) {
            throw new BaseCustomException(EDBMessages.INVALID_OBJECT_ID)
        }
        const { createdAt } = lastNotif
        const numberOfAdditionalNotifs = 1
        const limit = EPagination.MAX_NOTIFS_PER_PAGE + numberOfAdditionalNotifs
        const notifications = await this.findNotifs(noteId, limit, createdAt)
        const isEnd = limit > notifications.length
        const notifs = notifications.slice(0, EPagination.MAX_NOTIFS_PER_PAGE).map((notif) => ({
            ...notif,
            translation: {
                message: this.getNotifTranslation(notif, lang).message,
                type: '',
            },
        }))
        return { notifs, isEnd }
    }
}
