import type { GetNotifsBodyDTO, GetNotifsParamsDTO } from './DTOs'
import type { TGetNotifsReturn } from './types'

export interface INotificationController {
    getNotifications: (
        params: GetNotifsParamsDTO,
        body: GetNotifsBodyDTO,
    ) => Promise<TGetNotifsReturn>
}
