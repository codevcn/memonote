import { EValidationMessages } from '@/utils/validation/messages'
import { IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ValidImage, ValidChunk } from './validation'
import { Type } from 'class-transformer'
import { EArticleChunk } from './enums'
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
    @Type(() => ArticleChunkDTO)
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
    @ValidImage(EArticleFiles.MAX_IMAGE_SIZE)
    image: Buffer

    @IsMongoId()
    @IsNotEmpty()
    noteId: string
}
