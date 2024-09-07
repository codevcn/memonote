import { Injectable } from '@nestjs/common'
import AppRoot from 'app-root-path'
import { join } from 'path'
import { createClient, DeepgramClient, SyncPrerecordedResponse } from '@deepgram/sdk'
import fs, { existsSync, ReadStream } from 'fs'
import { appendFile, copyFile, mkdir, truncate, unlink } from 'fs/promises'
import type { TAudioChunkStatus, TCreateDirOfAudioChunk, TUploadIndentity } from './types'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { EAudioMessages } from './messages'
import ms from 'ms'

@Injectable()
export class TranscriptAudioService {
    private readonly audiosDirname: string = 'temp-audios'
    private readonly audiosDirPath: string = join(AppRoot.path, 'src', 'tools', this.audiosDirname)
    private readonly deepgramClient: DeepgramClient = createClient(process.env.DEEPGRAM_API_KEY)
    private readonly uploadsIndentity = new Map<string, TUploadIndentity>()
    private readonly audioChunksStatus = new Map<string, TAudioChunkStatus>()
    private readonly chunkStatusTimeout: number = ms('60s')

    constructor() {}

    private async checkMultipleUploads(noteUniqueName: string, uploadId: string): Promise<void> {
        const uploadIdentity = this.uploadsIndentity.get(noteUniqueName)
        if (uploadIdentity) {
            if (uploadIdentity.uploadId !== uploadId) {
                throw new BaseCustomException(EAudioMessages.MULTIPLE_UPLOAD)
            }
        } else {
            this.uploadsIndentity.set(noteUniqueName, { uploadId })
        }
    }

    private async createDirOfAudioChunkHandler(
        noteUniqueName: string,
    ): Promise<TCreateDirOfAudioChunk> {
        const chunkStatus = this.audioChunksStatus.get(noteUniqueName) as TAudioChunkStatus
        if (chunkStatus) {
            return {
                relativePath: chunkStatus.relativePath,
                isFirstChunk: false,
            }
        }
        const relativePath = await this.createDirOfAudioChunks(noteUniqueName)
        return { relativePath, isFirstChunk: true }
    }

    private async createDirOfAudioChunks(noteUniqueName: string): Promise<string> {
        const relativePath = join(this.audiosDirPath, noteUniqueName)
        await mkdir(relativePath, { recursive: true })
        return relativePath
    }

    private formatAbsoluteDirPathOfAudio(relativePath: string): string {
        return join(this.audiosDirPath, relativePath)
    }

    private async writeChunk(
        chunk: string,
        totalChunks: number,
        noteUniqueName: string,
        audioFilename: string, // with file extension
    ): Promise<void> {
        // const { isFirstChunk, relativePath } =
        //     await this.createDirOfAudioChunkHandler(noteUniqueName)
        // if (isFirstChunk) {
        //     this.audioChunksStatus.set(noteUniqueName, {
        //         chunksReceived: 0,
        //         totalChunks,
        //         timeoutId: setTimeout(async () => {
        //             await this.cleanupWhenUploadFail(noteUniqueName)
        //         }, this.chunkStatusTimeout),
        //         relativePath,
        //     })
        // }
        // const absoluteDirPath = this.formatAbsoluteDirPathOfAudio(relativePath)
        // const chunkFilePath = join(absoluteDirPath, audioFilename)
        // await appendFile(chunkFilePath, chunk, this.audioUnicode)
        // return { chunkFilePathBackup, docWasCreated }
    }

    private async transcriptAudio(fileReadStream: ReadStream): Promise<SyncPrerecordedResponse> {
        const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeFile(
            fileReadStream,
            {
                model: 'nova-2',
                smart_format: true,
                punctuate: true,
                paragraphs: true,
                language: 'vi',
            },
        )
        if (error) {
            throw error
        }
        return result
    }

    async transcriptAudioHandler(
        chunk: Buffer,
        totalChunks: number,
        noteUniqueName: string,
        noteId: string,
        uploadId: string,
    ): Promise<string> {
        // await this.checkMultipleUploads(noteUniqueName, uploadId)

        // await this.writeChunk(chunk, totalChunks, noteUniqueName, noteId)

        // const chunkStatus = this.audioChunksStatus.get(noteUniqueName) as TAudioChunkStatus
        // chunkStatus.chunksReceived++
        // if (chunkStatus.timeoutId) {
        //     clearTimeout(chunkStatus.timeoutId)
        // }

        // if (chunkStatus.chunksReceived === totalChunks) {
        //     await this.cleanUpWhenUploadSuccess(noteUniqueName, chunkFilePathBackup)
        //     if (!docWasCreated) {
        //         await this.createNewAudio(noteUniqueName, noteId, chunkStatus.relativePath)
        //     }
        // } else {
        //     chunkStatus.timeoutId = setTimeout(async () => {
        //         await this.cleanupWhenUploadFail(noteUniqueName)
        //     }, this.chunkStatusTimeout)
        // }

        // const readable = fs.createReadStream(join(this.audiosDirPath, noteUniqueName))
        // const transcriptResult = await this.transcriptAudio(readable)
        // const transcription = transcriptResult.results.channels[0].alternatives[0].transcript
        // return transcription
        return 'oke'
    }

    private async cleanUpWhenUploadSuccess(
        noteUniqueName: string,
        chunkFilePathBackup: string,
    ): Promise<void> {
        if (existsSync(chunkFilePathBackup)) {
            this.audioChunksStatus.delete(noteUniqueName)
            this.uploadsIndentity.delete(noteUniqueName)
            await unlink(chunkFilePathBackup)
        }
    }

    private async cleanupWhenUploadFail(noteUniqueName: string): Promise<void> {
        // const chunkStatus = this.audioChunksStatus.get(noteUniqueName) as TAudioChunkStatus
        // if (chunkStatus.docWasCreated) {
        //     const audioDirPath = join(this.audiosDirPath, chunkStatus.relativePath)
        //     const audioFileBackupPath = join(
        //         audioDirPath,
        //         this.formatAudioFilenameBackup(noteUniqueName),
        //     )
        //     const audioFilePath = join(audioDirPath, this.formatAudioFilename(noteUniqueName))
        //     await copyFile(audioFileBackupPath, audioFilePath)
        //     await unlink(audioFileBackupPath)
        // } else {
        //     const audioFilePath = join(
        //         this.audiosDirPath,
        //         chunkStatus.relativePath,
        //         this.formatAudioFilename(noteUniqueName),
        //     )
        //     await unlink(audioFilePath)
        // }
        // this.audioChunksStatus.delete(noteUniqueName)
        // this.uploadsIndentity.delete(noteUniqueName)
    }
}
