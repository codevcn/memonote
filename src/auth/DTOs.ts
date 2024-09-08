import { IsNotEmpty, IsString } from 'class-validator'

export class SignInPayloadDTO {
    @IsNotEmpty()
    @IsString()
    password: string
}
