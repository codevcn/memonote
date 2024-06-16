import { EValidationMessages } from '@/utils/messages'
import { IsOptional, IsString } from 'class-validator'
import type { TNoteForm } from '../types'

export class BroadcastNoteTypingDTO implements TNoteForm {
    @IsString({ message: EValidationMessages.INVALID_INPUT })
    @IsOptional()
    content?: string

    @IsString({ message: EValidationMessages.INVALID_INPUT })
    @IsOptional()
    title?: string

    @IsString({ message: EValidationMessages.INVALID_INPUT })
    @IsOptional()
    author?: string
}
