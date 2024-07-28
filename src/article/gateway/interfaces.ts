import { TClientConnectedEventPayload } from '@/note/gateway/types'
import { EInitialSocketEvents } from '@/utils/enums'

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {}
