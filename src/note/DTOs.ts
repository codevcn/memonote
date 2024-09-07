import { NOTE_PASSWORD_REGEX, NOTE_UNIQUE_NAME_REGEX } from '@/note/regex'
import { EValidationMessages } from '@/utils/validation/messages'
import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, Matches } from 'class-validator'
import { EEditors, EAudioChunk } from './enums'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import type { TNoteForm } from './types'
import { ENoteLengths } from './enums'
import { ValidChunk } from '@/article/validation'

export class TranscriptAudioDTO {
    @IsNotEmpty()
    @ValidChunk(EAudioChunk.SIZE_PER_CHUNK, {
        message: EValidationMessages.INVALID_INPUT,
    })
    chunk: string

    @IsNotEmpty()
    totalChunks: number

    @IsNotEmpty()
    uploadId: string
}

export class NoteCredentialsDTO {
    @IsNotEmpty()
    @IsString()
    @Matches(NOTE_UNIQUE_NAME_REGEX, { message: EValidationMessages.INVALID_NOTE_UNIQUE_NAME })
    noteUniqueName: string

    @IsNotEmpty()
    @IsMongoId()
    noteId: string
}

export class NoteUniqueNameDTO {
    @IsNotEmpty()
    @Matches(NOTE_UNIQUE_NAME_REGEX, { message: EValidationMessages.INVALID_NOTE_UNIQUE_NAME })
    noteUniqueName: string
}

export class NoteIdDTO {
    @IsNotEmpty()
    @IsMongoId()
    noteId: string
}

export class SetPasswordForNotePayloadDTO {
    @IsNotEmpty()
    @Matches(NOTE_PASSWORD_REGEX, { message: EValidationMessages.INVALID_PASSWORD })
    password: string

    @IsBoolean()
    logoutAll: boolean
}

export class SwitchEditorPayloadDTO {
    @IsNotEmpty()
    @IsEnum(EEditors)
    editor: EEditors
}

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
