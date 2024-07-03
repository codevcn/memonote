import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Notification } from '@/database/notification.model'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ENotificationMessages } from './messages'

@Injectable()
export class NotificationService {
    constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

    async findByNoteUniqueName(noteUniqueName: string): Promise<Notification> {
        const notification = await this.notificationModel
            .findOne({ note: noteUniqueName })
            .populate('notes')
            .lean()
        console.log('>>> notifications >>>', notification)
        if (!notification) {
            throw new BaseCustomException(ENotificationMessages.NOTIFICATION_NOT_FOUND)
        }
        return notification
    }
}
