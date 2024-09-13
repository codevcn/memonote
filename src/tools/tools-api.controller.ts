import { Body, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { APIRoutes } from '../utils/routes.js'
import { TranscribeAudioService } from './transcribe-audio.service.js'
import { FileInterceptor } from '@nestjs/platform-express'
import { TTranscribeAudioFile } from './types.js'
import { NoteUniqueNameDTO } from '../note/DTOs.js'
import { EAudioFields } from './constants.js'
import { TranscribeAudioPayloadDTO } from './DTOs.js'
import { IToolsAPIController } from './interfaces.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'

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
        @Param() params: NoteUniqueNameDTO,
        @Body() payload: TranscribeAudioPayloadDTO,
        @UploadedFile() file?: TTranscribeAudioFile,
    ) {
        if (!file) throw new BaseCustomException(EAudioMessages.EMPTY_FILE_INPUT)
        await this.transribeAudioService.validateMulterStoredFile(file)
        const { audioLang, clientSocketId } = payload
        const transcription = await this.transribeAudioService.transcribeAudioHandler(
            params.noteUniqueName,
            file,
            audioLang,
            clientSocketId,
        )
        return { transcription }
    }
}
