import { IsNotEmpty } from 'class-validator'

export class SignInPayloadDTO {
    @IsNotEmpty()
    password: string
}
