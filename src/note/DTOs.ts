import { NOTE_PASSWORD_REGEX, NOTE_UNIQUE_NAME_REGEX } from '../note/regex.js'
import { EValidationMessages } from '../utils/validation/messages.js'
import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, Matches } from 'class-validator'
import { EEditors } from './constants.js'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { ENoteLengths } from './constants.js'

export class NoteCredentialsDTO {
    @IsNotEmpty()
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

export class BroadcastNoteTypingDTO {
    @IsString()
    @MaxLength(ENoteLengths.MAX_LENGTH_NOTE_CONTENT, {
        message: EValidationMessages.MAX_LENGTH_INVALID,
    })
    @IsOptional()
    content?: string

    @IsString()
    @IsOptional()
    title?: string

    @IsString()
    @IsOptional()
    author?: string
}
