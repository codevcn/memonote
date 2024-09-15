import type { Response } from 'express'
import type { NoteUniqueNameDTO } from '../note/DTOs.js'
import type { TranscribeAudioPayloadDTO } from './DTOs.js'
import type { TTranscribeAudioFile, TTranscribeAudios } from './types.js'

export interface IToolsAPIController {
    transcribeAudio(
        params: NoteUniqueNameDTO,
        payload: TranscribeAudioPayloadDTO,
        res: Response,
        file?: Array<TTranscribeAudioFile>,
    ): Promise<void>
}
