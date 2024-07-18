import { IsNotEmpty } from 'class-validator'

export class RequestLangDTO {
    @IsNotEmpty()
    langCode: string
}
