import { Body, Controller, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { APIRoutes } from '../utils/routes.js'
import { TranscribeAudioService } from './transcribe-audio.service.js'
import { FilesInterceptor } from '@nestjs/platform-express'
import { TTranscribeAudioFile } from './types.js'
import { NoteUniqueNameDTO } from '../note/DTOs.js'
import { EAudioFields, EAudioFiles } from './constants.js'
import { TranscribeAudioPayloadDTO } from './DTOs.js'
import { IToolsAPIController } from './interfaces.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'
import { Response } from 'express'

@Controller(APIRoutes.tools)
export class ToolsAPIController implements IToolsAPIController {
    constructor(private transribeAudioService: TranscribeAudioService) {}

    @Post('transcribe-audio/:noteUniqueName')
    @UseInterceptors(
        FilesInterceptor(
            EAudioFields.TRANSCRIBE_AUDIO,
            EAudioFiles.MAX_FILES_COUNT,
            TranscribeAudioService.initTranscribeAudioSaver(),
        ),
    )
    async transcribeAudio(
        @Param() params: NoteUniqueNameDTO,
        @Body() payload: TranscribeAudioPayloadDTO,
        @Res() res: Response,
        @UploadedFiles() files?: Array<TTranscribeAudioFile>,
    ) {
        const { noteUniqueName } = params
        const { audioLang, clientSocketId } = payload
        res.setHeader('Content-Type', 'application/json')
        try {
            if (files && files.length > 0) {
                await this.transribeAudioService.validateMulterStoredFiles(files)
                await this.transribeAudioService.transcribeAudiosHandler(
                    noteUniqueName,
                    files,
                    audioLang,
                    clientSocketId,
                    res,
                )
            } else {
                throw new BaseCustomException(EAudioMessages.EMPTY_FILE_INPUT)
            }
        } catch (error) {
            throw error
        } finally {
            await this.transribeAudioService.cleanUpWhenTranscribeDone(noteUniqueName)
        }
        res.end()
    }
}
