import { Injectable } from '@nestjs/common'
import AppRoot from 'app-root-path'
import path, { join } from 'path'
import { createClient, DeepgramClient, SyncPrerecordedResponse } from '@deepgram/sdk'
import { createReadStream, ReadStream } from 'fs'
import { unlink } from 'fs/promises'
import type { TTranscribeAudioFile } from './types.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'
import { EAudioFiles, EAudioLangs, ETransribeFiles } from './constants.js'
import { fileTypeFromBuffer } from 'file-type'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js'
import multer from 'multer'
import { Request } from 'express'
import { NoteUniqueNameDTO } from '../note/DTOs.js'
import { validateJson } from '../utils/helpers.js'

@Injectable()
export class TranscribeAudioService {
    static readonly audiosDirname: string = 'temp-audios'
    static readonly audiosDirPath: string = join(
        AppRoot.path,
        'src',
        'tools',
        TranscribeAudioService.audiosDirname,
    )
    static readonly supportedAudiotypes = ['audio/mpeg', 'audio/wav']
    private readonly deepgramClient: DeepgramClient = createClient(process.env.DEEPGRAM_API_KEY)
    private readonly inTranscribing = new Set<string>()
    private readonly deepGramModelForTranscribe: string = 'nova-2'

    static initTranscribeAudioSaver = (): MulterOptions => {
        return {
            storage: multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, TranscribeAudioService.audiosDirPath)
                },
                filename: function (req, file, cb) {
                    const { noteUniqueName } = req.params
                    cb(null, `${noteUniqueName}-${Date.now()}-${path.extname(file.originalname)}`)
                },
            }),
            limits: {
                fileSize: EAudioFiles.MAX_FILE_SIZE,
                fieldNameSize: EAudioFiles.MAX_FILENAME_SIZE,
            },
            fileFilter: function (req: Request, file: any, cb) {
                const { params } = req
                validateJson(params, NoteUniqueNameDTO)
                    .then(() => {
                        cb(null, true)
                    })
                    .catch(() => {
                        cb(new Error(EAudioMessages.UNABLE_HANDLED_FILE_INPUT), false)
                    })
            },
        }
    }

    private async checkMultipleUploads(noteUniqueName: string): Promise<void> {
        const uploadIdentity = this.inTranscribing.has(noteUniqueName)
        if (uploadIdentity) {
            throw new BaseCustomException(EAudioMessages.MULTIPLE_UPLOAD)
        } else {
            this.inTranscribing.add(noteUniqueName)
        }
    }

    private getTranscriptionFromResult(result: SyncPrerecordedResponse): string {
        return result.results.channels[0].alternatives[0].transcript
    }

    private async transcribeAudio(
        fileStream: ReadStream,
        audioLang: EAudioLangs,
    ): Promise<SyncPrerecordedResponse> {
        const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeFile(
            fileStream,
            {
                model: this.deepGramModelForTranscribe,
                smart_format: true,
                punctuate: true,
                paragraphs: true,
                language: audioLang,
            },
        )
        if (error) {
            throw error
        }
        return result
    }

    async transcribeAudioHandler(
        noteUniqueName: string,
        audioFile: TTranscribeAudioFile,
        audioLang: EAudioLangs,
    ): Promise<string | null> {
        await this.checkMultipleUploads(noteUniqueName)

        let transcription: string
        const readable = createReadStream(audioFile.path)
        try {
            const result = await this.transcribeAudio(readable, audioLang)
            transcription = this.getTranscriptionFromResult(result)
        } catch (error) {
            await this.cleanUpWhenTranscribeDone(noteUniqueName, audioFile)
            throw error
        }

        await this.cleanUpWhenTranscribeDone(noteUniqueName, audioFile)

        return transcription
    }

    private async cleanUpWhenTranscribeDone(
        noteUniqueName: string,
        audioFile: TTranscribeAudioFile,
    ): Promise<void> {
        this.inTranscribing.delete(noteUniqueName)
        await unlink(audioFile.path)
    }

    static async isValidAudio(buffer: Buffer): Promise<void> {
        if (buffer.byteLength > ETransribeFiles.SIZE_PER_CHUNK) {
            throw new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT)
        }
        const fileType = await fileTypeFromBuffer(buffer)
        if (!fileType) {
            throw new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT)
        }
        const isValid = this.supportedAudiotypes.includes(fileType.mime)
        if (!isValid) {
            throw new BaseCustomException(EAudioMessages.UNSUPPORTED_FILE_TYPE)
        }
    }
}
