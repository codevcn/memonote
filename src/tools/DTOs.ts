import { IsEnum, IsNotEmpty } from 'class-validator'
import { EAudioLangs } from './constants.js'

export class TranscribeAudiosPayloadDTO {
    @IsNotEmpty()
    @IsEnum(EAudioLangs)
    audioLang: EAudioLangs
}

export class TranscribeAudioPayloadDTO {
    @IsNotEmpty()
    @IsEnum(EAudioLangs)
    audioLang: EAudioLangs
}
