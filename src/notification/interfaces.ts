import type { Notif } from '@/notification/notification.model'
import type { GetNotificationsDTO } from './DTOs'

export interface INotificationController {
    getNotifications: (params: GetNotificationsDTO) => Promise<Notif[]>
}
