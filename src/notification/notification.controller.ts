import { Controller, Get, Query } from '@nestjs/common'
import type { INotificationController } from './interfaces'
import { NotificationService } from './notification.service'
import { APIRoutes } from '@/utils/routes'
import { GetNotificationsDTO } from './DTOs'

@Controller(APIRoutes.notification)
export class NotificationController implements INotificationController {
    constructor(private notificationSerice: NotificationService) {}

    @Get()
    async getNotifications(@Query() query: GetNotificationsDTO) {
        const { n, p } = query
        return await this.notificationSerice.findByNoteId(n, p)
    }
}
