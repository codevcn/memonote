import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import {
    Notification,
    TNotificationDocument,
    TNotificationModel,
} from '../notification/notification.model.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EEventEmitterEvents } from './constants.js'
import type { TGetNotifsReturn, TNotifTranslation, TNewNotif, TNotifWithTrans } from './types.js'
import { EDBMessages, ESystemMessages } from '../utils/messages.js'
import { ENotificationTypes, EPagination } from './constants.js'
import type { LastNotificationDTO } from './DTOs.js'
import { ELangCodes } from '../lang/constants.js'
import dayjs from 'dayjs'
import { I18nService } from 'nestjs-i18n'
import type { IDataI18nTranslations } from '../lang/i18n.generated.js'
import { BaseCustomEmittedEvent } from '../utils/custom.events.js'

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: TNotificationModel,
        private eventEmitter: EventEmitter2,
        private i18n: I18nService<IDataI18nTranslations>,
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
        lang: ELangCodes,
    ): Promise<void> {
        const newNotif = await this.createNewNotif(noteId, notif)
        const translation = this.translateNotif(newNotif, lang)
        this.eventEmitter.emit(
            EEventEmitterEvents.TRIGGER_NOTIFY,
            new BaseCustomEmittedEvent<TNotifWithTrans>({
                ...newNotif,
                translation,
                noteUniqueName,
            }),
        )
    }

    calculateTimeDifference(inputTime: Date, lang: ELangCodes): string {
        const now = dayjs()
        const specifiedTime = dayjs(inputTime)
        const differenceInSeconds = Math.abs(now.diff(specifiedTime, 'second'))
        let timeUnit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'seconds'
        let timeCount: number = 0

        if (differenceInSeconds >= 31536000) {
            // greater than 12 months
            timeCount = Math.floor(differenceInSeconds / 31536000)
            timeUnit = 'year'
        } else if (differenceInSeconds >= 2678400) {
            // greater than 31 days
            timeCount = Math.floor(differenceInSeconds / 2678400)
            timeUnit = 'month'
        } else if (differenceInSeconds >= 86400) {
            // greater than 24 hours
            timeCount = Math.floor(differenceInSeconds / 86400)
            timeUnit = 'day'
        } else if (differenceInSeconds >= 3600) {
            // greater than 60 minutes
            timeCount = Math.floor(differenceInSeconds / 3600)
            timeUnit = 'hour'
        } else if (differenceInSeconds >= 60) {
            // greater than 60 seconds
            timeCount = Math.floor(differenceInSeconds / 60)
            timeUnit = 'minute'
        } else {
            timeCount = differenceInSeconds // seconds gap
            timeUnit = 'seconds'
        }

        return `${timeCount} ${this.i18n.t(`notification.timeUnits.${timeUnit}`, { lang })}`
    }

    translateNotif(notif: Notification, lang: ELangCodes): TNotifTranslation {
        const notifType = notif.type
        const createdAt = this.calculateTimeDifference(notif.createdAt, lang)
        if (lang === ELangCodes.VI) {
            const config = { lang: ELangCodes.VI }
            switch (notifType) {
                case ENotificationTypes.REMOVE_PASSWORD:
                    return {
                        message: this.i18n.t('notification.message.Remove_password', config),
                        type: this.i18n.t('notification.type.Remove_password', config),
                        createdAt: this.i18n.t('notification.createdAt', {
                            ...config,
                            args: { date: createdAt },
                        }),
                    }
                case ENotificationTypes.SET_PASSWORD:
                    return {
                        message: this.i18n.t('notification.message.Set_password', config),
                        type: this.i18n.t('notification.type.Set_password', config),
                        createdAt: this.i18n.t('notification.createdAt', {
                            ...config,
                            args: { date: createdAt },
                        }),
                    }
                case ENotificationTypes.CREATE_NEW_NOTE:
                    return {
                        message: this.i18n.t('notification.message.Create_new_note', config),
                        type: this.i18n.t('notification.type.Create_new_note', config),
                        createdAt: this.i18n.t('notification.createdAt', {
                            ...config,
                            args: { date: createdAt },
                        }),
                    }
            }
        } else {
            const config = { lang: ELangCodes.EN }
            switch (notifType) {
                case ENotificationTypes.REMOVE_PASSWORD:
                    return {
                        message: this.i18n.t('notification.message.Remove_password', config),
                        type: this.i18n.t('notification.type.Remove_password', config),
                        createdAt: this.i18n.t('notification.createdAt', {
                            ...config,
                            args: { date: createdAt },
                        }),
                    }
                case ENotificationTypes.SET_PASSWORD:
                    return {
                        message: this.i18n.t('notification.message.Set_password', config),
                        type: this.i18n.t('notification.type.Set_password', config),
                        createdAt: this.i18n.t('notification.createdAt', {
                            ...config,
                            args: { date: createdAt },
                        }),
                    }
                case ENotificationTypes.CREATE_NEW_NOTE:
                    return {
                        message: this.i18n.t('notification.message.Create_new_note', config),
                        type: this.i18n.t('notification.type.Create_new_note', config),
                        createdAt: this.i18n.t('notification.createdAt', {
                            ...config,
                            args: { date: createdAt },
                        }),
                    }
            }
        }
        throw new BaseCustomException(ESystemMessages.INTERNAL_SERVER_ERROR)
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
            translation: this.translateNotif(notif, lang),
        }))
        return { notifs, isEnd }
    }
}
