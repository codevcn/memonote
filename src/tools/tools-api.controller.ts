import {
    Body,
    Controller,
    Post,
    Res,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common'
import { APIRoutes } from '../utils/routes.js'
import { TranscribeAudioService } from './transcribe-audio.service.js'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { TTranscribeAudioFile } from './types.js'
import { EAudioFields, EAudioFiles } from './constants.js'
import { TranscribeAudioPayloadDTO, TranscribeAudiosPayloadDTO } from './DTOs.js'
import { IToolsAPIController } from './interfaces.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'
import { Response } from 'express'

@Controller(APIRoutes.tools)
export class ToolsAPIController implements IToolsAPIController {
    constructor(private transribeAudioService: TranscribeAudioService) {}

    @Post('transcribe-audios/:noteUniqueName')
    @UseInterceptors(
        FilesInterceptor(
            EAudioFields.TRANSCRIBE_AUDIOS,
            EAudioFiles.MAX_FILES_COUNT,
            TranscribeAudioService.initTranscribeAudioSaver(),
        ),
    )
    async transcribeAudios(
        @Body() payload: TranscribeAudiosPayloadDTO,
        @Res() res: Response,
        @UploadedFiles() files?: Array<TTranscribeAudioFile>,
    ) {
        if (files && files.length > 0) {
            const { audioLang } = payload
            try {
                res.setHeader('Content-Type', 'application/json')
                await this.transribeAudioService.validateMulterStoredFiles(files)
                await this.transribeAudioService.transcribeAudiosHandler(files, audioLang, res)
            } catch (error) {
                throw error
            } finally {
                await this.transribeAudioService.cleanUpWhenTranscribeDone(files)
            }
            res.end()
        } else {
            throw new BaseCustomException(EAudioMessages.EMPTY_FILE_INPUT)
        }
    }

    @Post('transcribe-audio/:noteUniqueName')
    @UseInterceptors(
        FileInterceptor(
            EAudioFields.TRANSCRIBE_AUDIO,
            TranscribeAudioService.initTranscribeAudioSaver(),
        ),
    )
    async transcribeAudio(
        @Body() payload: TranscribeAudioPayloadDTO,
        @UploadedFile() file?: TTranscribeAudioFile,
    ) {
        if (file) {
            const { audioLang } = payload
            try {
                await this.transribeAudioService.validateMulterStoredFile(file)
                return await this.transribeAudioService.transcribeAudioHandler(file, audioLang)
            } catch (error) {
                throw error
            } finally {
                await this.transribeAudioService.cleanUpWhenTranscribeDone([file])
            }
        } else {
            throw new BaseCustomException(EAudioMessages.EMPTY_FILE_INPUT)
        }
    }
}
