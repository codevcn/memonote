import type { NoteUniqueNameDTO } from '../note/DTOs.js'
import type { TranscribeAudioPayloadDTO } from './DTOs.js'
import type { TTranscribeAudioFile, TTranscribeAudioRes } from './types.js'

export interface IToolsAPIController {
    transcribeAudio(
        file: TTranscribeAudioFile,
        params: NoteUniqueNameDTO,
        payload: TranscribeAudioPayloadDTO,
    ): Promise<TTranscribeAudioRes>
}
