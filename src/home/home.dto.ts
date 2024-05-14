import { noteUniqueNameRegEx } from '@/note/regex'
import { EValidationMessages } from '@/utils/messages'
import { IsNotEmpty, Matches } from 'class-validator'

export class SignInPayloadDTO {
    @IsNotEmpty()
    password: string
}

export class NoteUniqueNameDTO {
    @IsNotEmpty()
    @Matches(noteUniqueNameRegEx, { message: EValidationMessages.INVALID_INPUT })
    noteUniqueName: string
}
