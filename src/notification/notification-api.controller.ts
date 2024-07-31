import { Body, Controller, Param, Post } from '@nestjs/common'
import type { INotificationAPIController } from './interfaces'
import { NotificationService } from './notification.service'
import { APIRoutes } from '@/utils/routes'
import { GetNotifsBodyDTO } from './DTOs'
import { ELangCodes } from '@/lang/enums'
import { Lang } from '@/lang/lang.decorator'
import { NoteIdDTO } from '@/note/DTOs'

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
