import { Body, Controller, Post, Query } from '@nestjs/common'
import type { INotificationController } from './interfaces'
import { NotificationService } from './notification.service'
import { APIRoutes } from '@/utils/routes'
import { GetNotifsBodyDTO, GetNotifsParamsDTO } from './DTOs'

@Controller(APIRoutes.notification)
export class NotificationController implements INotificationController {
    constructor(private notificationSerice: NotificationService) {}

    @Post()
    async getNotifications(@Query() query: GetNotifsParamsDTO, @Body() body: GetNotifsBodyDTO) {
        const { n } = query
        return await this.notificationSerice.findByNoteId(n, body.lastNotif)
    }
}
