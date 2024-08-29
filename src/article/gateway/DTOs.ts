import { EValidationMessages } from '@/utils/validation/messages'
import { IsMongoId, IsNotEmpty } from 'class-validator'
import { ValidImage, ValidChunk } from './validation'
import { Transform } from 'class-transformer'
import { EArticleChunk } from '../enums'
import { transformImageData } from './helpers'
import { EFileSize } from './enums'

export class PublishArticlePayloadDTO {
    @IsNotEmpty()
    @ValidChunk(EArticleChunk.SIZE_PER_CHUNK, {
        message: EValidationMessages.INVALID_INPUT,
    })
    articleChunk: string

    @IsNotEmpty()
    totalChunks: number

    @IsNotEmpty()
    noteUniqueName: string

    @IsNotEmpty()
    @IsMongoId()
    noteId: string

    @IsNotEmpty()
    uploadId: string
}

export class UploadImageDTO {
    @IsNotEmpty()
    @Transform(({ value }) => transformImageData(value), { toClassOnly: true })
    @ValidImage(EFileSize.MAX_IMAGE_SIZE)
    image: ArrayBuffer

    @IsMongoId()
    @IsNotEmpty()
    noteId: string
}
