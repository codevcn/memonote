import { Body, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { APIRoutes } from '../utils/routes.js'
import { TranscribeAudioService } from './transcribe-audio.service.js'
import { FileInterceptor } from '@nestjs/platform-express'
import { TTranscribeAudioFile } from './types.js'
import { NoteUniqueNameDTO } from '../note/DTOs.js'
import { EAudioFields } from './constants.js'
import { TranscribeAudioPayloadDTO } from './DTOs.js'
import { IToolsAPIController } from './interfaces.js'

@Controller(APIRoutes.tools)
export class ToolsAPIController implements IToolsAPIController {
    constructor(private transribeAudioService: TranscribeAudioService) {}

    @Post('transcribe-audio/:noteUniqueName')
    @UseInterceptors(
        FileInterceptor(
            EAudioFields.TRANSCRIBE_AUDIO,
            TranscribeAudioService.initTranscribeAudioSaver(),
        ),
    )
    async transcribeAudio(
        @UploadedFile() file: TTranscribeAudioFile,
        @Param() params: NoteUniqueNameDTO,
        @Body() payload: TranscribeAudioPayloadDTO,
    ) {
        const { audioLang } = payload
        const transcription = await this.transribeAudioService.transcribeAudioHandler(
            params.noteUniqueName,
            file,
            audioLang,
        )
        return { transcription }
    }
}
