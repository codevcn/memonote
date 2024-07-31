import type { NoteIdDTO } from '@/note/DTOs'
import type { GetNotifsBodyDTO } from './DTOs'
import type { TGetNotifsReturn } from './types'

export interface INotificationAPIController {
    getNotifications: (
        params: NoteIdDTO,
        body: GetNotifsBodyDTO,
        lang: string,
    ) => Promise<TGetNotifsReturn>
}
