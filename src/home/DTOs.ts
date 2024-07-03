import { noteUniqueNameRegEx } from '@/note/regex'
import { EValidationMessages } from '@/utils/validation/messages'
import { IsNotEmpty, Matches } from 'class-validator'

export class GetNoteOnHomePageParamsDTO {
    @IsNotEmpty()
    @Matches(noteUniqueNameRegEx, { message: EValidationMessages.INVALID_NOTE_UNIQUE_NAME })
    noteUniqueName: string
}
