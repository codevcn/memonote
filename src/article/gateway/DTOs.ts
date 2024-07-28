import { ENoteLengths } from '@/note/enums'
import { EValidationMessages } from '@/utils/validation/messages'
import { IsMongoId, IsNotEmpty, MaxLength } from 'class-validator'

export class PublishNotePayloadDTO {
    @IsNotEmpty()
    @MaxLength(ENoteLengths.MAX_LENGTH_NOTE_CONTENT, { message: EValidationMessages.INVALID_INPUT })
    articleChunk: string

    @IsNotEmpty()
    totalChunks: number

    @IsNotEmpty()
    noteUniqueName: string

    @IsNotEmpty()
    @IsMongoId()
    noteId: string
}
