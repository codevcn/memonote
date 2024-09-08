import { IsNotEmpty, IsString } from 'class-validator'

export class RequestLangDTO {
    @IsNotEmpty()
    @IsString()
    langCode: string
}
