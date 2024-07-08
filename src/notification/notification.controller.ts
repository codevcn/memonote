import { Controller, Get, Param } from '@nestjs/common'
import type { INotificationController } from './interfaces'
import { NotificationService } from './notification.service'
import { APIRoutes } from '@/utils/routes'
import { GetNotificationsDTO } from './DTOs'

@Controller(APIRoutes.notification)
export class NotificationController implements INotificationController {
    constructor(private notificationSerice: NotificationService) {}

    @Get('/:noteId')
    async getNotifications(@Param() params: GetNotificationsDTO) {
        const { noteId } = params
        const notifications = await this.notificationSerice.findByNoteId(noteId)
        return notifications
    }
}
