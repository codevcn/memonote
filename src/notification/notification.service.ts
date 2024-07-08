import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Notification, type TNotificationModel } from '@/notification/notification.model'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BaseCustomEvent } from '@/note/gateway/events'
import { EEventEmitterEvents } from './gateway/enums'
import type { TNewNotif } from './types'
import { EDBMessages } from '@/utils/messages'
import { type TNoteDocument } from '@/note/note.model'

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: TNotificationModel,
        private eventEmitter: EventEmitter2,
    ) {}

    async findByNoteId(noteId: string): Promise<Notification[]> {
        if (!Types.ObjectId.isValid(noteId)) {
            throw new BaseCustomException(EDBMessages.INVALID_OBJECT_ID)
        }
        const notifications = await this.notificationModel
            .find({ note: new Types.ObjectId(noteId) })
            .sort({ createdAt: 'desc', read: 'desc' })
            .lean()
        if (notifications && notifications.length > 0) {
            return notifications
        }
        return []
    }

    async createNotif(noteId: string, notif: TNewNotif): Promise<void> {
        const newNotification = new this.notificationModel()
        newNotification.note = new Types.ObjectId(noteId)
        newNotification.message = notif.message
        newNotification.type = notif.type
        newNotification.read = notif.read
        await newNotification.save()
    }

    async createNotifHandler(note: TNoteDocument, notif: TNewNotif): Promise<void> {
        await this.createNotif(note._id.toString(), notif)
        this.eventEmitter.emit(
            EEventEmitterEvents.TRIGGER_NOTIFY,
            new BaseCustomEvent<TNewNotif>(notif, note.uniqueName),
        )
    }
}
