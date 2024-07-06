import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Notif, Notification, type TNotificationModel } from '@/notification/notification.model'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ENotificationMessages } from './messages'
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

    async findByNoteId(noteId: string): Promise<Notif[]> {
        if (!Types.ObjectId.isValid(noteId)) {
            throw new BaseCustomException(EDBMessages.INVALID_OBJECT_ID)
        }
        const notification = await this.notificationModel
            .findOne({ note: new Types.ObjectId(noteId) })
            .populate('note')
            .lean()
        if (!notification) {
            throw new BaseCustomException(ENotificationMessages.NOTIFICATION_NOT_FOUND)
        }
        return notification.notifications
    }

    async createNotif(noteId: string, notif: TNewNotif): Promise<void> {
        const objectId = new Types.ObjectId(noteId)
        const notification = await this.notificationModel.findOne({ note: objectId })
        if (notification) {
            notification.notifications.push(notif)
            await notification.save()
        } else {
            const newNotification = new this.notificationModel()
            newNotification.note = objectId
            newNotification.notifications = [notif]
            await newNotification.save()
        }
    }

    async createNotifHandler(note: TNoteDocument, notif: TNewNotif): Promise<void> {
        await this.createNotif(note._id.toString(), notif)
        this.eventEmitter.emit(
            EEventEmitterEvents.TRIGGER_NOTIFY,
            new BaseCustomEvent<TNewNotif>(notif, note.uniqueName),
        )
    }
}
