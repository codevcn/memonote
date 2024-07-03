import { Notification } from '@/database/notification.model'
import { GetNotificationsDTO } from './DTOs'

export interface INotificationController {
    getNotifications: (params: GetNotificationsDTO) => Promise<Notification>
}
