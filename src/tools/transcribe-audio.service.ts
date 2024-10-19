import { Injectable } from '@nestjs/common'
import AppRoot from 'app-root-path'
import path, { join } from 'path'
import { createClient, DeepgramClient } from '@deepgram/sdk'
import { createReadStream, ReadStream } from 'fs'
import { readFile, unlink } from 'fs/promises'
import type { TTranscribeAudioFile, TTranscribeAudio, TParagraphs } from './types.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'
import { EAudioFiles, EAudioLangs } from './constants.js'
import { fileTypeFromBuffer } from 'file-type'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js'
import multer from 'multer'
import type { Request, Response } from 'express'
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
    private readonly deepGramModelForTranscribe: string = 'nova-2'

    static formatAudioFilename(noteUniqueName: string, nameWithExt: string): string {
        return `${noteUniqueName}-${Date.now()}${path.extname(nameWithExt)}`
    }

    static initTranscribeAudioSaver = (): MulterOptions => {
        return {
            storage: multer.diskStorage({
                destination: function (req: Request, file, cb) {
                    cb(null, TranscribeAudioService.audiosDirPath)
                },
                filename: function (req: Request, file, cb) {
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

    private async transcribeAudio(
        fileStream: ReadStream,
        audioLang: EAudioLangs,
    ): Promise<TTranscribeAudio> {
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
        const transcription = result.results.channels[0].alternatives[0]
        let paragraphs: TParagraphs[] | null = null
        if (transcription.paragraphs) {
            paragraphs = transcription.paragraphs.paragraphs.map((para) => ({
                wordsCount: para.num_words,
                sentences: para.sentences.map((sen) => sen.text),
            }))
        }
        return {
            transcription: transcription.transcript,
            confidence: transcription.confidence,
            paragraphs,
        }
    }

    private async transcribeAudios(
        audioFiles: Array<TTranscribeAudioFile>,
        audioLang: EAudioLangs,
        res: Response,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            let transcribedCount: number = 0
            for (const audio of audioFiles) {
                const readStream = createReadStream(audio.path)
                const audioFilename = audio.filename,
                    audioOriginalName = audio.originalname
                this.transcribeAudio(readStream, audioLang)
                    .then((result) => {
                        res.write(
                            JSON.stringify({
                                ...result,
                                audioId: audioFilename, // set audio id as saved audio filename
                                audioFilename: audioOriginalName,
                            }),
                        )
                    })
                    .catch((error) => {
                        res.write(
                            JSON.stringify({
                                error,
                                audioId: audioFilename,
                                audioFilename: audioOriginalName,
                            }),
                        )
                    })
                    .finally(() => {
                        readStream.destroy()
                        transcribedCount++
                        if (transcribedCount === audioFiles.length) {
                            resolve()
                        }
                    })
            }
        })
    }

    async transcribeAudiosHandler(
        audioFiles: Array<TTranscribeAudioFile>,
        audioLang: EAudioLangs,
        res: Response,
    ): Promise<void> {
        await this.transcribeAudios(audioFiles, audioLang, res)
    }

    async transcribeAudioHandler(
        audio: TTranscribeAudioFile,
        audioLang: EAudioLangs,
    ): Promise<TTranscribeAudio> {
        return await this.transcribeAudio(createReadStream(audio.path), audioLang)
    }

    async cleanUpWhenTranscribeDone(files: Array<TTranscribeAudioFile>): Promise<void> {
        const deletePromises = files.map((file) => unlink(file.path))
        await Promise.all(deletePromises)
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

    async validateMulterStoredFile(file: TTranscribeAudioFile): Promise<void> {
        const buffer = await readFile(file.path)
        const fileExtension = path.extname(file.originalname).slice(1)
        await TranscribeAudioService.isValidAudio(buffer, fileExtension)
    }

    async validateMulterStoredFiles(files: Array<TTranscribeAudioFile>): Promise<void> {
        const promises: Promise<void>[] = []
        for (const file of files) {
            promises.push(this.validateMulterStoredFile(file))
        }
        await Promise.all(promises)
    }
}
