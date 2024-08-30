import { EValidationMessages } from '@/utils/validation/messages'
import { IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ValidImage, ValidChunk } from './validation'
import { Transform } from 'class-transformer'
import { EArticleChunk } from './enums'
import { transformImageData } from './helpers'
import { EArticleFiles } from './enums'

export class ArticleChunkDTO {
    @IsNotEmpty()
    @ValidChunk(EArticleChunk.SIZE_PER_CHUNK, {
        message: EValidationMessages.INVALID_INPUT,
    })
    chunk: string

    @IsNotEmpty()
    totalChunks: number

    @IsNotEmpty()
    noteUniqueName: string

    @IsNotEmpty()
    uploadId: string
}

export class PublishArticlePayloadDTO {
    @IsOptional()
    @ValidateNested()
    articleChunk?: ArticleChunkDTO

    @IsOptional()
    @IsString({ each: true })
    imgs?: string[]

    @IsNotEmpty()
    @IsMongoId()
    noteId: string
}

export class UploadImageDTO {
    @IsNotEmpty()
    @Transform(({ value }) => transformImageData(value), { toClassOnly: true })
    @ValidImage(EArticleFiles.MAX_IMAGE_SIZE)
    image: ArrayBuffer

    @IsMongoId()
    @IsNotEmpty()
    noteId: string
}
