import { noteUniqueNameRegEx } from '@/note/regex'
import { EValidationMessages } from '@/utils/messages'
import { IsNotEmpty, Matches } from 'class-validator'

export class SignInPayloadDTO {
    @IsNotEmpty()
    password: string
}

export class NoteUniqueNameOnParamDTO {
    @IsNotEmpty()
    @Matches(noteUniqueNameRegEx, { message: EValidationMessages.INVALID_NOTE_UNIQUE_NAME })
    noteUniqueName: string
}
