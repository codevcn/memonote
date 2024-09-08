import { Body, Controller, Param, Post } from '@nestjs/common'
import type { INotificationAPIController } from './interfaces.js'
import { NotificationService } from './notification.service.js'
import { APIRoutes } from '../utils/routes.js'
import { GetNotifsBodyDTO } from './DTOs.js'
import { ELangCodes } from '../lang/constants.js'
import { Lang } from '../lang/lang.decorator.js'
import { NoteIdDTO } from '../note/DTOs.js'

@Controller(APIRoutes.notification)
export class NotificationAPIController implements INotificationAPIController {
    constructor(private notificationSerice: NotificationService) {}

    @Post(':noteId')
    async getNotifications(
        @Param() params: NoteIdDTO,
        @Body() body: GetNotifsBodyDTO,
        @Lang() lang: ELangCodes,
    ) {
        const { noteId } = params
        return await this.notificationSerice.fetchNotificationsHandler(noteId, body.lastNotif, lang)
    }
}
