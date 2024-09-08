import { Injectable } from '@nestjs/common'
import AppRoot from 'app-root-path'
import { join } from 'path'
import { createClient, DeepgramClient, SyncPrerecordedResponse } from '@deepgram/sdk'
import { createReadStream, ReadStream } from 'fs'
import { mkdir, rm, writeFile } from 'fs/promises'
import type { TAudioChunkStatus, TCreateDirOfAudioChunk, TUploadIndentity } from './types.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'
import ms from 'ms'

@Injectable()
export class TranscriptAudioService {
    private readonly audiosDirname: string = 'temp-audios'
    private readonly audiosDirPath: string = join(AppRoot.path, 'src', 'tools', this.audiosDirname)
    private readonly deepgramClient: DeepgramClient = createClient(process.env.DEEPGRAM_API_KEY)
    private readonly uploadsIndentity = new Map<string, TUploadIndentity>()
    private readonly audioChunksStatus = new Map<string, TAudioChunkStatus>()
    private readonly chunkStatusTimeout: number = ms('60s')
    private readonly audioUnicode: NodeJS.BufferEncoding = 'utf-8'
    static readonly supportedAudiotypes = ['mp3', 'mp4', 'm4a', 'wav', 'webm']

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

    private async createDirOfAudioChunks(noteUniqueName: string): Promise<TCreateDirOfAudioChunk> {
        const chunkStatus = this.audioChunksStatus.get(noteUniqueName) as TAudioChunkStatus
        if (chunkStatus) {
            return {
                relativePath: chunkStatus.relativePath,
                isFirstChunk: false,
            }
        }
        const relativePath = join(this.audiosDirPath, noteUniqueName)
        await mkdir(relativePath, { recursive: true })
        return { relativePath, isFirstChunk: true }
    }

    private formatAbsoluteDirPathOfAudio(relativePath: string): string {
        return join(this.audiosDirPath, relativePath)
    }

    private formatAudioChunkFilename(
        noteUniqueName: string,
        filetype: string,
        orderOfChunk: number,
    ): string {
        return `o${orderOfChunk}-${noteUniqueName}.${filetype}`
    }

    private async writeChunk(
        chunk: Buffer,
        totalChunks: number,
        noteUniqueName: string,
        filetype: string,
    ): Promise<void> {
        const { isFirstChunk, relativePath } = await this.createDirOfAudioChunks(noteUniqueName)
        if (isFirstChunk) {
            this.audioChunksStatus.set(noteUniqueName, {
                chunksReceived: 0,
                totalChunks,
                timeoutId: setTimeout(async () => {
                    await this.cleanupWhenUploadFail(noteUniqueName)
                }, this.chunkStatusTimeout),
                relativePath,
            })
        }
        const absoluteDirPath = this.formatAbsoluteDirPathOfAudio(relativePath)
        const chunkStatus = this.audioChunksStatus.get(noteUniqueName)!
        const chunkFilePath = join(
            absoluteDirPath,
            this.formatAudioChunkFilename(noteUniqueName, filetype, chunkStatus.chunksReceived + 1),
        )
        await writeFile(chunkFilePath, chunk, this.audioUnicode)
    }

    private async transcribeAudio(fileSource: string): Promise<SyncPrerecordedResponse> {
        const readable = createReadStream(join(this.audiosDirPath, noteUniqueName))
        const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeFile(
            fileSource,
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

    async transcribeAudioHandler(
        chunk: Buffer,
        filetype: string,
        totalChunks: number,
        noteUniqueName: string,
        uploadId: string,
    ): Promise<string | null> {
        await this.checkMultipleUploads(noteUniqueName, uploadId)

        await this.writeChunk(chunk, totalChunks, noteUniqueName, filetype)

        const chunkStatus = this.audioChunksStatus.get(noteUniqueName)!
        chunkStatus.chunksReceived++
        if (chunkStatus.timeoutId) {
            clearTimeout(chunkStatus.timeoutId)
        }

        let transcription: string | null = null
        if (chunkStatus.chunksReceived === totalChunks) {
            await this.cleanUpWhenUploadSuccess(noteUniqueName)
            transcription = await this.transcribeAudio('')
        } else {
            chunkStatus.timeoutId = setTimeout(async () => {
                await this.cleanupWhenUploadFail(noteUniqueName)
            }, this.chunkStatusTimeout)
        }

        return transcription
    }

    private async cleanUpWhenUploadSuccess(noteUniqueName: string): Promise<void> {
        this.audioChunksStatus.delete(noteUniqueName)
        this.uploadsIndentity.delete(noteUniqueName)
    }

    private async cleanupWhenUploadFail(noteUniqueName: string): Promise<void> {
        const chunkStatus = this.audioChunksStatus.get(noteUniqueName) as TAudioChunkStatus
        const audiosDirPath = join(this.audiosDirPath, chunkStatus.relativePath)
        await rm(audiosDirPath, { recursive: true, force: true })
        this.audioChunksStatus.delete(noteUniqueName)
        this.uploadsIndentity.delete(noteUniqueName)
    }
}
