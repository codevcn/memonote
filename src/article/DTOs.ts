import { EValidationMessages } from '../utils/validation/messages.js'
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ValidImage, ValidChunk } from './validation.js'
import { Type } from 'class-transformer'
import { EArticleChunk } from './constants.js'

export class ArticleChunkDTO {
    @IsNotEmpty()
    @ValidChunk(EArticleChunk.SIZE_PER_CHUNK, {
        message: EValidationMessages.INVALID_INPUT,
    })
    @IsString()
    chunk: string

    @IsNotEmpty()
    @IsNumber()
    totalChunks: number

    @IsNotEmpty()
    @IsString()
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
}

export class UploadImageDTO {
    @IsNotEmpty()
    @ValidImage()
    image: Buffer
}
