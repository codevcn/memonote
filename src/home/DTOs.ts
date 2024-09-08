import { NOTE_UNIQUE_NAME_REGEX } from '../note/regex.js'
import { EValidationMessages } from '../utils/validation/messages.js'
import { IsNotEmpty, Matches } from 'class-validator'

export class GetNoteOnHomePageDTO {
    @IsNotEmpty()
    @Matches(NOTE_UNIQUE_NAME_REGEX, { message: EValidationMessages.INVALID_NOTE_UNIQUE_NAME })
    noteUniqueName: string
}
