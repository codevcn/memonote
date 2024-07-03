import { Controller, Get, Param } from '@nestjs/common'
import type { INotificationController } from './interfaces'
import { NotificationService } from './notification.service'
import { APIRoutes } from '@/utils/routes'
import { GetNotificationsDTO } from './DTOs'

@Controller(APIRoutes.notification)
export class NotificationController implements INotificationController {
    constructor(private notificationSerice: NotificationService) {}

    @Get('noties/:noteUniqueName')
    async getNotifications(@Param() params: GetNotificationsDTO) {
        const { noteUniqueName } = params
        const notification = await this.notificationSerice.findByNoteUniqueName(noteUniqueName)
        return notification
    }
}
