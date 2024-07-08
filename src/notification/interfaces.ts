import type { Notification } from '@/notification/notification.model'
import type { GetNotificationsDTO } from './DTOs'

export interface INotificationController {
    getNotifications: (params: GetNotificationsDTO) => Promise<Notification[]>
}
