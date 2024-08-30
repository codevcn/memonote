import type { NoteIdDTO } from '@/note/DTOs'
import type { GetNotifsBodyDTO } from './DTOs'
import type { TGetNotifsReturn } from './types'
import type { BaseCustomEvent } from '@/note/events'
import type { TClientConnectedEventPayload } from '@/note/types'
import type { EInitialSocketEvents } from '@/utils/enums'
import type { TNotificationDocument } from './notification.model'

export interface INotificationAPIController {
    getNotifications: (
        params: NoteIdDTO,
        body: GetNotifsBodyDTO,
        lang: string,
    ) => Promise<TGetNotifsReturn>
}

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    notify: (event: BaseCustomEvent<TNotificationDocument>) => void
}
