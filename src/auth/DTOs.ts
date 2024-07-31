import { NOTE_UNIQUE_NAME_REGEX } from '@/note/regex'
import { EValidationMessages } from '@/utils/validation/messages'
import { IsNotEmpty, Matches } from 'class-validator'

export class SignInPayloadDTO {
    @IsNotEmpty()
    password: string
}
