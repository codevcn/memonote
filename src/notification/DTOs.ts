import { noteUniqueNameRegEx } from '@/note/regex'
import { EValidationMessages } from '@/utils/validation/messages'
import { IsNotEmpty, Matches } from 'class-validator'

export class GetNotificationsDTO {
    @IsNotEmpty()
    @Matches(noteUniqueNameRegEx, { message: EValidationMessages.INVALID_INPUT })
    noteUniqueName: string
}
