import type { NoteIdDTO } from '@/note/DTOs'
import type { StreamableFile } from '@nestjs/common'
import type { TClientConnectedEventPayload } from '@/note/types'
import type { EInitialSocketEvents } from '@/utils/enums'
import type { PublishArticlePayloadDTO, UploadImageDTO } from './DTOs'
import type { TPublishArticleReturn, TUploadImageReturn } from './types'

export interface IArticleAPIController {
    fetchArticle: (params: NoteIdDTO) => Promise<StreamableFile | null>
}

export interface IInitialSocketEventEmits {
    [EInitialSocketEvents.CLIENT_CONNECTED](payload: TClientConnectedEventPayload): void
}

export interface IMessageSubcribers {
    publishArticleInChunks: (data: PublishArticlePayloadDTO) => Promise<TPublishArticleReturn>
    uploadImage: (data: UploadImageDTO) => Promise<TUploadImageReturn>
}
