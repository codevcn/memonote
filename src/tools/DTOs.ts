import { IsEnum, IsNotEmpty } from 'class-validator'
import { EAudioLangs } from './constants.js'

export class TranscribeAudioPayloadDTO {
    @IsNotEmpty()
    @IsEnum(EAudioLangs)
    audioLang: EAudioLangs
}
