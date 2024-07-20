import { NOTE_PASSWORD_REGEX, NOTE_UNIQUE_NAME_REGEX } from '@/note/regex'
import { EValidationMessages } from '@/utils/validation/messages'
import { IsBoolean, IsEnum, IsNotEmpty, Matches } from 'class-validator'
import { EEditors } from './enums'

export class NoteUniqueNameParamsDTO {
    @IsNotEmpty()
    @Matches(NOTE_UNIQUE_NAME_REGEX, { message: EValidationMessages.INVALID_INPUT })
    noteUniqueName: string
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
