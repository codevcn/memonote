import type { NoteIdDTO } from '../note/DTOs.js'
import type { GetNotifsBodyDTO } from './DTOs.js'
import type { TGetNotifsReturn } from './types.js'
import type { BaseCustomEvent } from '../note/events.js'
import type { TClientConnectedEventPayload } from '../note/types.js'
import type { EInitialSocketEvents } from '../utils/constants.js'
import type { TNotificationDocument } from './notification.model.js'

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
