import { NOTE_PASSWORD_REGEX, NOTE_UNIQUE_NAME_REGEX } from '@/note/regex'
import { EValidationMessages } from '@/utils/validation/messages'
import { IsBoolean, IsNotEmpty, Matches } from 'class-validator'

export class AddPasswordForNoteParamsDTO {
    @IsNotEmpty()
    @Matches(NOTE_UNIQUE_NAME_REGEX, { message: EValidationMessages.INVALID_INPUT })
    noteUniqueName: string
}

export class AddPasswordForNotePayloadDTO {
    @IsNotEmpty()
    @Matches(NOTE_PASSWORD_REGEX, { message: EValidationMessages.INVALID_PASSWORD })
    password: string

    @IsBoolean()
    logoutAll: boolean
}
