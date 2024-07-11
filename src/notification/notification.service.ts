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
import type { TGetNotifsReturn, TNewNotif } from './types'
import { EDBMessages } from '@/utils/messages'
import { EPagination } from './enums'
import type { LastNotificationDTO } from './DTOs'

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: TNotificationModel,
        private eventEmitter: EventEmitter2,
    ) {}

    async findByNoteId(noteId: string, lastNotif: LastNotificationDTO): Promise<TGetNotifsReturn> {
        if (!Types.ObjectId.isValid(noteId)) {
            throw new BaseCustomException(EDBMessages.INVALID_OBJECT_ID)
        }
        const { createdAt } = lastNotif
        const numberOfAdditionalNotifs = 1
        const numberOfSkipped = EPagination.MAX_NOTIFS_PER_PAGE + numberOfAdditionalNotifs
        const notifications = await this.notificationModel
            .find({
                $and: [
                    { note: new Types.ObjectId(noteId) },
                    createdAt ? { createdAt: { $lt: new Date(createdAt) } } : {},
                ],
            })
            .sort({ createdAt: 'desc' })
            .limit(numberOfSkipped)
            .lean()
        const isEnd = numberOfSkipped > notifications.length
        const notifs = notifications.slice(0, EPagination.MAX_NOTIFS_PER_PAGE)
        return { notifs, isEnd }
    }

    async createNotif(noteId: string, notif: TNewNotif): Promise<TNotificationDocument> {
        const newNotification = new this.notificationModel()
        newNotification.note = new Types.ObjectId(noteId)
        newNotification.message = notif.message
        newNotification.type = notif.type
        return await newNotification.save()
    }

    async createNotifHandler(
        noteId: string,
        noteUniqueName: string,
        notif: TNewNotif,
    ): Promise<void> {
        const newNotif = await this.createNotif(noteId, notif)
        this.eventEmitter.emit(
            EEventEmitterEvents.TRIGGER_NOTIFY,
            new BaseCustomEvent<TNotificationDocument>(newNotif, noteUniqueName),
        )
    }
}
