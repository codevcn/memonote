import { Injectable } from '@nestjs/common'
import AppRoot from 'app-root-path'
import path, { join } from 'path'
import { createClient, DeepgramClient, SyncPrerecordedResponse } from '@deepgram/sdk'
import { createReadStream, ReadStream } from 'fs'
import { mkdir, readFile, rm, rmdir } from 'fs/promises'
import type {
    TTranscribeAudioFile,
    TTranscribeAudios,
    TTranscribeAudioState,
    TTranscribeStates,
} from './types.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'
import { EAudioFiles, EAudioLangs } from './constants.js'
import { fileTypeFromBuffer } from 'file-type'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js'
import multer from 'multer'
import type { Request, Response } from 'express'
import { NoteUniqueNameDTO } from '../note/DTOs.js'
import { validateJson } from '../utils/helpers.js'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EEventEmitterEvents } from '../note/constants.js'
import { BaseCustomEmittedEvent } from '../utils/custom.events.js'

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

    constructor(private eventEmitter: EventEmitter2) {}

    static formatAudioFilename(noteUniqueName: string, originalFilename: string): string {
        return `${noteUniqueName}-${Date.now()}${path.extname(originalFilename)}`
    }

    static initTranscribeAudioSaver = (): MulterOptions => {
        return {
            storage: multer.diskStorage({
                destination: function (req: Request, file, cb) {
                    const { noteUniqueName } = req.params
                    const fileFolder = join(TranscribeAudioService.audiosDirPath, noteUniqueName)
                    mkdir(fileFolder, { recursive: true })
                        .then(() => {
                            cb(null, fileFolder)
                        })
                        .catch(() => {
                            cb(
                                new BaseCustomException(
                                    EAudioMessages.UNABLE_TO_CREATE_AUDIO_FOLDER,
                                ),
                                '',
                            )
                        })
                },
                filename: function (req, file, cb) {
                    const { noteUniqueName } = req.params
                    cb(
                        null,
                        TranscribeAudioService.formatAudioFilename(
                            noteUniqueName,
                            file.originalname,
                        ),
                    )
                },
            }),
            limits: {
                fileSize: EAudioFiles.MAX_FILE_SIZE,
                fieldNameSize: EAudioFiles.MAX_FILENAME_SIZE,
                files: EAudioFiles.MAX_FILES_COUNT,
            },
            fileFilter: function (req: Request, file, cb) {
                const { originalname } = file
                if (!file || !originalname) {
                    cb(new BaseCustomException(EAudioMessages.EMPTY_FILE_INPUT), false)
                    return
                }
                if (!path.extname(originalname)) {
                    cb(new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT), false)
                    return
                }
                validateJson(req.params, NoteUniqueNameDTO)
                    .then(() => {
                        cb(null, true)
                    })
                    .catch(() => {
                        cb(new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT), false)
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
        audioId: string,
        fileStream: ReadStream,
        audioLang: EAudioLangs,
        audioFilename: string,
    ): Promise<TTranscribeAudios> {
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
        return { audioId, transcription: this.getTranscriptionFromResult(result), audioFilename }
    }

    private async transcribeAudios(
        audioFiles: Array<TTranscribeAudioFile>,
        audioLang: EAudioLangs,
        res: Response,
    ): Promise<void> {
        const promises: Promise<void>[] = []
        for (const audio of audioFiles) {
            const readStream = createReadStream(audio.path)
            promises.push(
                new Promise((resolve, reject) => {
                    this.transcribeAudio(audio.filename, readStream, audioLang, audio.originalname)
                        .then((result) => {
                            res.write(JSON.stringify(result))
                            resolve()
                        })
                        .catch((error) => {
                            reject(error)
                        })
                }),
            )
        }
        await Promise.all(promises)
    }

    async transcribeAudiosHandler(
        noteUniqueName: string,
        audioFiles: Array<TTranscribeAudioFile>,
        audioLang: EAudioLangs,
        clientSocketId: string,
        res: Response,
    ): Promise<void> {
        await this.checkMultipleUploads(noteUniqueName)

        await this.informTranscribingState(clientSocketId, 'transcribing')
        await this.transcribeAudios(audioFiles, audioLang, res)
    }

    private async informTranscribingState(
        clientSocketId: string,
        state: TTranscribeStates,
    ): Promise<void> {
        this.eventEmitter.emit(
            EEventEmitterEvents.TRANSCRIBE_AUIDO_STATE,
            new BaseCustomEmittedEvent<TTranscribeAudioState>({
                clientSocketId,
                state,
            }),
        )
    }

    async cleanUpWhenTranscribeDone(noteUniqueName: string): Promise<void> {
        this.inTranscribing.delete(noteUniqueName)
        const filesFolder = join(TranscribeAudioService.audiosDirPath, noteUniqueName)
        await rm(filesFolder, { recursive: true, force: true })
    }

    static async isValidAudio(fileBuffer: Buffer, fileExtension: string): Promise<void> {
        const fileType = await fileTypeFromBuffer(fileBuffer)
        if (!fileType) {
            throw new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT)
        }
        if (fileType.ext !== fileExtension) {
            throw new BaseCustomException(EAudioMessages.CONTENT_CONFLICT_EXT)
        }
        const isValid = this.supportedAudiotypes.includes(fileType.mime)
        if (!isValid) {
            throw new BaseCustomException(EAudioMessages.UNSUPPORTED_FILE_TYPE)
        }
    }

    async validateStoredFile(file: TTranscribeAudioFile): Promise<void> {
        const buffer = await readFile(file.path)
        const fileExtension = path.extname(file.originalname).slice(1)
        await TranscribeAudioService.isValidAudio(buffer, fileExtension)
    }

    async validateMulterStoredFiles(files: Array<TTranscribeAudioFile>): Promise<void> {
        const promises: Promise<void>[] = []
        for (const file of files) {
            promises.push(this.validateStoredFile(file))
        }
        await Promise.all(promises)
    }
}
