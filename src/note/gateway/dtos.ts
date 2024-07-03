import { EValidationMessages } from '@/utils/validation/messages'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import type { TNoteForm } from '../types'
import { ENoteLengths } from '../enums'

export class BroadcastNoteTypingDTO implements TNoteForm {
    @IsString({ message: EValidationMessages.INVALID_INPUT })
    @MaxLength(ENoteLengths.MAX_LENGTH_NOTE_CONTENT, {
        message: EValidationMessages.MAX_LENGTH_INVALID,
    })
    @IsOptional()
    content?: string

    @IsString({ message: EValidationMessages.INVALID_INPUT })
    @IsOptional()
    title?: string

    @IsString({ message: EValidationMessages.INVALID_INPUT })
    @IsOptional()
    author?: string
}
