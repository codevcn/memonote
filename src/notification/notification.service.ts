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

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: TNotificationModel,
        private eventEmitter: EventEmitter2,
    ) {}

    async findByNoteId(noteId: string, page: number): Promise<TGetNotifsReturn> {
        if (!Types.ObjectId.isValid(noteId)) {
            throw new BaseCustomException(EDBMessages.INVALID_OBJECT_ID)
        }
        const numberOfNotifsToSkip = (page - 1) * EPagination.MAX_NOTIFS_PER_PAGE
        const notifications = await this.notificationModel
            .find({ note: new Types.ObjectId(noteId) })
            .sort({ createdAt: 'desc' })
            .skip(numberOfNotifsToSkip)
            .limit(EPagination.MAX_NOTIFS_PER_PAGE)
            .lean()
        const total = await this.notificationModel.countDocuments()
        return { notifs: notifications, total }
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
