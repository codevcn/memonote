import type { GetNotificationsDTO } from './DTOs'
import type { TGetNotifsReturn } from './types'

export interface INotificationController {
    getNotifications: (params: GetNotificationsDTO) => Promise<TGetNotifsReturn>
}
