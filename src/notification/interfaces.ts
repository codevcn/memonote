import type { NoteIdDTO } from '../note/DTOs.js'
import type { GetNotifsBodyDTO } from './DTOs.js'
import type { TGetNotifsReturn, TNotifWithTrans } from './types.js'
import type { TClientConnectedEventPayload } from '../note/types.js'
import type { EInitialSocketEvents } from '../utils/constants.js'
import type { BaseCustomEmittedEvent } from '../utils/custom.events.js'

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
    notify: (event: BaseCustomEmittedEvent<TNotifWithTrans>) => void
}
