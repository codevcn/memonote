import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { EAudioLangs } from './constants.js'

export class TranscribeAudioPayloadDTO {
    @IsNotEmpty()
    @IsEnum(EAudioLangs)
    audioLang: EAudioLangs

    @IsString()
    @IsNotEmpty()
    clientSocketId: string
}
