import { EInitialSocketEvents } from './enums'
import type { TClientConnectedEventPayload } from './types'

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}
