import type { BaseCustomEvent } from '@/note/gateway/events'
import type { TClientConnectedEventPayload } from '@/note/gateway/types'
import type { EInitialSocketEvents } from '@/utils/enums'
import type { TNewNotif } from '../types'

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    notify: (event: BaseCustomEvent<TNewNotif>) => void
}
