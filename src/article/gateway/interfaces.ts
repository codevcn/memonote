import type { TClientConnectedEventPayload } from '@/note/gateway/types'
import type { EInitialSocketEvents } from '@/utils/enums'
import type { PublishNotePayloadDTO } from './DTOs'
import { TPublishArticleReturn } from './types'

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    publishArticle: (data: PublishNotePayloadDTO) => Promise<TPublishArticleReturn>
}
