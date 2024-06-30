import { notePasswordRegEx, noteUniqueNameRegEx } from '@/note/regex'
import { EValidationMessages } from '@/utils/messages'
import { IsBoolean, IsNotEmpty, Matches } from 'class-validator'

export class AddPasswordForNoteParamsDTO {
    @IsNotEmpty()
    @Matches(noteUniqueNameRegEx, { message: EValidationMessages.INVALID_INPUT })
    noteUniqueName: string
}

export class AddPasswordForNotePayloadDTO {
    @IsNotEmpty()
    @Matches(notePasswordRegEx, { message: EValidationMessages.INVALID_PASSWORD })
    password: string

    @IsBoolean()
    logoutAll: boolean
}
