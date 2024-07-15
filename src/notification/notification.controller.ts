import { Body, Controller, Post, Query } from '@nestjs/common'
import type { INotificationController } from './interfaces'
import { NotificationService } from './notification.service'
import { APIRoutes } from '@/utils/routes'
import { GetNotifsBodyDTO, GetNotifsParamsDTO } from './DTOs'
import { ELangCodes } from '@/lang/enums'
import { Lang } from '@/lang/lang.decorator'

@Controller(APIRoutes.notification)
export class NotificationController implements INotificationController {
    constructor(private notificationSerice: NotificationService) {}

    @Post()
    async getNotifications(
        @Query() query: GetNotifsParamsDTO,
        @Body() body: GetNotifsBodyDTO,
        @Lang() lang: ELangCodes,
    ) {
        const { n } = query
        return await this.notificationSerice.fetchNotificationsHandler(n, body.lastNotif, lang)
    }
}
