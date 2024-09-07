import type { NoteCredentialsDTO, NoteIdDTO } from '@/note/DTOs'
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
    publishArticle: (
        data: PublishArticlePayloadDTO,
        noteCredentials: NoteCredentialsDTO,
    ) => Promise<TPublishArticleReturn>
    uploadImage: (
        data: UploadImageDTO,
        noteCredentials: NoteCredentialsDTO,
    ) => Promise<TUploadImageReturn>
}
