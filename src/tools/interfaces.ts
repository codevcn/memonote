import type { Response } from 'express'
import type { TranscribeAudioPayloadDTO } from './DTOs.js'
import type { TTranscribeAudioFile, TTranscribeAudio } from './types.js'

export interface IToolsAPIController {
    transcribeAudios(
        payload: TranscribeAudioPayloadDTO,
        res: Response,
        file?: Array<TTranscribeAudioFile>,
    ): Promise<void>
    transcribeAudio(
        payload: TranscribeAudioPayloadDTO,
        file?: TTranscribeAudioFile,
    ): Promise<TTranscribeAudio>
}
