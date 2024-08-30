import { appendFile, mkdir, stat, truncate, unlink, copyFile } from 'fs/promises'
import { createReadStream, existsSync } from 'fs'
import dayjs from 'dayjs'
import type {
    TArticleChunkStatus,
    TCreateDirOfArticleChunk,
    TUploadIndentity,
    TWriteChunks,
} from './types'
import { join } from 'path'
import ms from 'ms'
import { Injectable, StreamableFile } from '@nestjs/common'
import { Article, TArticleDocument, TArticleModel } from './article.model'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import AppRoot from 'app-root-path'
import { EArticleMessages } from './messages'
import { EArticleChunk } from './enums'
import { WsException } from '@nestjs/websockets'
import { FileServerService } from './file-server.service'

@Injectable()
export class ArticleService {
    private readonly uploadsIndentity = new Map<string, TUploadIndentity>()
    private readonly articleChunksStatus = new Map<string, TArticleChunkStatus>()
    private readonly articlesDirname: string = 'articles'
    private readonly articlesDirPath = join(AppRoot.path, 'src', 'article', this.articlesDirname)
    private readonly chunkStatusTimeout: number = ms('60s')
    private readonly articleUnicode: NodeJS.BufferEncoding = 'utf-8'
    private readonly articleFiletype: string = 'txt'
    private readonly backupArticleSuffix: string = 'backup'

    constructor(
        @InjectModel(Article.name) private articleModel: TArticleModel,
        private fileServerService: FileServerService,
    ) {}

    private async createNewArticle(
        noteUniqueName: string,
        noteId: string,
        localPath: string,
    ): Promise<TArticleDocument> {
        return await this.articleModel.create({
            note: new Types.ObjectId(noteId),
            localPath,
            content: { createdAt: new Date() },
            filename: noteUniqueName,
        })
    }

    private formatAbsoluteDirPathOfArticle(relativePath: string): string {
        return join(this.articlesDirPath, relativePath)
    }

    private async createDirOfArticleChunk(
        articleCreatedAt: Date,
        articleFileName: string,
    ): Promise<string> {
        const dayjsObj = dayjs(articleCreatedAt)
        const [year, month, dateOfmonth] = [dayjsObj.year(), dayjsObj.month() + 1, dayjsObj.date()]

        // determine "am" or "pm" when article is created
        const now = dayjs()
        const startOfDay = dayjs().hour(6).minute(0).second(0)
        const endOfDay = dayjs().hour(18).minute(0).second(0)
        const period: string = now.isAfter(startOfDay) && now.isBefore(endOfDay) ? 'am' : 'pm'

        const relativePath = join(
            year.toString(),
            month.toString(),
            dateOfmonth.toString(),
            period,
            articleFileName[0],
        )
        const absolutePath = this.formatAbsoluteDirPathOfArticle(relativePath)

        await mkdir(absolutePath, { recursive: true })

        return relativePath
    }

    private formatArticleFilename(filename: string): string {
        return `${filename}.${this.articleFiletype}`
    }

    private formatArticleFilenameBackup(noteUniqueName: string): string {
        return this.formatArticleFilename(`${noteUniqueName}-${this.backupArticleSuffix}`)
    }

    private async createDirOfArticleChunkHandler(
        noteUniqueName: string,
        noteId: string,
    ): Promise<TCreateDirOfArticleChunk> {
        const chunkStatus = this.articleChunksStatus.get(noteUniqueName) as TArticleChunkStatus
        if (chunkStatus) {
            return {
                relativePath: chunkStatus.relativePath,
                docWasCreated: chunkStatus.docWasCreated,
                isFirstChunk: false,
            }
        }
        let relativePath: string, docWasCreated: boolean
        const article = await this.articleModel.findOne({ note: new Types.ObjectId(noteId) })
        if (article) {
            relativePath = article.localPath
            docWasCreated = true
        } else {
            const dateOfFirstUpload = new Date()
            relativePath = await this.createDirOfArticleChunk(dateOfFirstUpload, noteUniqueName)
            docWasCreated = false
        }
        return { relativePath, docWasCreated, isFirstChunk: true }
    }

    private async checkMultipleUploads(noteUniqueName: string, uploadId: string): Promise<void> {
        const uploadIdentity = this.uploadsIndentity.get(noteUniqueName)
        if (uploadIdentity) {
            if (uploadIdentity.uploadId !== uploadId) {
                throw new WsException(EArticleMessages.MULTIPLE_UPLOAD)
            }
        } else {
            this.uploadsIndentity.set(noteUniqueName, { uploadId })
        }
    }

    private async writeChunks(
        chunk: string,
        totalChunks: number,
        noteUniqueName: string,
        noteId: string,
    ): Promise<TWriteChunks> {
        const { docWasCreated, isFirstChunk, relativePath } =
            await this.createDirOfArticleChunkHandler(noteUniqueName, noteId)
        if (isFirstChunk) {
            this.articleChunksStatus.set(noteUniqueName, {
                chunksReceived: 0,
                totalChunks,
                timeoutId: setTimeout(async () => {
                    await this.cleanupWhenUploadFail(noteUniqueName)
                }, this.chunkStatusTimeout),
                relativePath,
                docWasCreated,
            })
        }
        const articleFilename = this.formatArticleFilename(noteUniqueName)
        const absoluteDirPath = this.formatAbsoluteDirPathOfArticle(relativePath)
        const chunkFilePath = join(absoluteDirPath, articleFilename)
        const chunkFilePathBackup = join(
            absoluteDirPath,
            this.formatArticleFilenameBackup(noteUniqueName),
        )
        const chunkStatus = this.articleChunksStatus.get(noteUniqueName) as TArticleChunkStatus
        if (chunkStatus.chunksReceived === 0 && existsSync(chunkFilePath)) {
            await copyFile(chunkFilePath, chunkFilePathBackup)
            await truncate(chunkFilePath, 0)
        }
        await appendFile(chunkFilePath, chunk, this.articleUnicode)
        return { chunkFilePathBackup, docWasCreated }
    }

    async uploadArticleChunk(
        chunk: string,
        totalChunks: number,
        noteUniqueName: string,
        noteId: string,
        uploadId: string,
    ): Promise<void> {
        console.log('>>> upload article chunk here')
        await this.checkMultipleUploads(noteUniqueName, uploadId)

        const { chunkFilePathBackup, docWasCreated } = await this.writeChunks(
            chunk,
            totalChunks,
            noteUniqueName,
            noteId,
        )

        const chunkStatus = this.articleChunksStatus.get(noteUniqueName) as TArticleChunkStatus
        chunkStatus.chunksReceived++
        if (chunkStatus.timeoutId) {
            clearTimeout(chunkStatus.timeoutId)
        }

        if (chunkStatus.chunksReceived === totalChunks) {
            await this.cleanUpWhenUploadSuccess(noteUniqueName, chunkFilePathBackup)
            if (!docWasCreated) {
                await this.createNewArticle(noteUniqueName, noteId, chunkStatus.relativePath)
            }
        } else {
            chunkStatus.timeoutId = setTimeout(async () => {
                await this.cleanupWhenUploadFail(noteUniqueName)
            }, this.chunkStatusTimeout)
        }
    }

    private async cleanUpWhenUploadSuccess(
        noteUniqueName: string,
        chunkFilePathBackup: string,
    ): Promise<void> {
        if (existsSync(chunkFilePathBackup)) {
            this.articleChunksStatus.delete(noteUniqueName)
            this.uploadsIndentity.delete(noteUniqueName)
            await unlink(chunkFilePathBackup)
        }
    }

    private async cleanupWhenUploadFail(noteUniqueName: string): Promise<void> {
        const chunkStatus = this.articleChunksStatus.get(noteUniqueName) as TArticleChunkStatus
        if (chunkStatus.docWasCreated) {
            const articleDirPath = join(this.articlesDirPath, chunkStatus.relativePath)
            const articleFileBackupPath = join(
                articleDirPath,
                this.formatArticleFilenameBackup(noteUniqueName),
            )
            const articleFilePath = join(articleDirPath, this.formatArticleFilename(noteUniqueName))
            await copyFile(articleFileBackupPath, articleFilePath)
            await unlink(articleFileBackupPath)
        } else {
            const articleFilePath = join(
                this.articlesDirPath,
                chunkStatus.relativePath,
                this.formatArticleFilename(noteUniqueName),
            )
            await unlink(articleFilePath)
        }
        this.articleChunksStatus.delete(noteUniqueName)
        this.uploadsIndentity.delete(noteUniqueName)
    }

    async fetchArticle(noteId: string): Promise<StreamableFile | null> {
        const article = await this.articleModel.findOne({
            note: new Types.ObjectId(noteId),
        })
        if (!article) {
            return null
        }
        const filenameWithExtension = this.formatArticleFilename(article.filename)
        const articleFilepath = join(
            this.formatAbsoluteDirPathOfArticle(article.localPath),
            filenameWithExtension,
        )
        const readStream = createReadStream(articleFilepath, {
            highWaterMark: EArticleChunk.SIZE_PER_CHUNK,
        })
        const articleStat = await stat(articleFilepath)
        return new StreamableFile(readStream, {
            type: 'text/plain',
            disposition: `attachment; filename="${filenameWithExtension}"`,
            length: articleStat.size,
        })
    }
}
