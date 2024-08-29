import type { TClientConnectedEventPayload } from '@/note/gateway/types'
import type { EInitialSocketEvents } from '@/utils/enums'
import type { PublishArticlePayloadDTO, UploadImageDTO } from './DTOs'
import type { TPublishArticleReturn, TUploadImageReturn } from './types'

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    publishArticle: (data: PublishArticlePayloadDTO) => Promise<TPublishArticleReturn>
    uploadImages: (data: UploadImageDTO) => Promise<TUploadImageReturn>
}
