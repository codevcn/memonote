import { appendFile, mkdir, truncate, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import dayjs from 'dayjs'
import type { TArticleChunkStatus, TcreateDirOfArticleChunk } from './types'
import { join } from 'path'
import ms from 'ms'
import { Injectable } from '@nestjs/common'
import { Article, TArticleDocument, TArticleModel } from './article.model'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Injectable()
export class ArticleService {
    private readonly articleChunksStatus = new Map<string, TArticleChunkStatus>()
    private readonly articlesDirname: string = 'articles'
    private readonly articlesDirPath = join(__dirname, this.articlesDirname)
    private readonly chunkStatusTimeout: number = ms('60s')
    private readonly articleUnicode: NodeJS.BufferEncoding = 'utf-8'
    private readonly articleFiletype: string = 'txt'

    constructor(@InjectModel(Article.name) private articleModel: TArticleModel) {}

    private async createNewArticle(
        noteUniqueName: string,
        localPath: string,
    ): Promise<TArticleDocument> {
        return await this.articleModel.create({
            note: noteUniqueName,
            localPath,
            content: { createdAt: new Date() },
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

        // determine "am" or "pm" right now
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

    private formatArticleFilename(noteUniqueName: string): string {
        return `${noteUniqueName}.${this.articleFiletype}`
    }

    private async createDirOfArticleChunkHandler(
        noteUniqueName: string,
        noteId: string,
        totalChunks: number,
    ): Promise<TcreateDirOfArticleChunk> {
        const chunkStatus = this.articleChunksStatus.get(noteUniqueName)
        if (chunkStatus) {
            return {
                relativePath: chunkStatus.relativePath,
                isCreatedBefore: chunkStatus.isCreatedBefore,
            }
        }
        let relativePath: string, isCreatedBefore: boolean
        const article = await this.articleModel.findOne({ note: new Types.ObjectId(noteId) })
        if (article) {
            relativePath = article.localPath
            isCreatedBefore = true
        } else {
            const dateOfFirstUpload = new Date()
            relativePath = await this.createDirOfArticleChunk(dateOfFirstUpload, noteUniqueName)
            isCreatedBefore = false
        }
        this.articleChunksStatus.set(noteUniqueName, {
            chunksReceived: 0,
            totalChunks,
            timeoutId: null,
            relativePath: relativePath,
            isCreatedBefore,
        })
        return { relativePath, isCreatedBefore }
    }

    async uploadArticleChunk(
        chunk: string,
        totalChunks: number,
        noteUniqueName: string,
        noteId: string,
    ): Promise<void> {
        const result = await this.createDirOfArticleChunkHandler(
            noteUniqueName,
            noteId,
            totalChunks,
        )
        console.log('>>> DirPath result >>>', { result })
        const chunkStatus = this.articleChunksStatus.get(noteUniqueName)!
        console.log('>>> chunk Status >>>', { chunkStatus })
        const articleFilename = this.formatArticleFilename(noteUniqueName)
        const absoluteDirPath = this.formatAbsoluteDirPathOfArticle(result.relativePath)
        console.log('>>> absolute DirPath >>>', { absoluteDirPath })
        const chunkFilePath = join(absoluteDirPath, articleFilename)
        if (chunkStatus.chunksReceived === 0 && existsSync(chunkFilePath)) {
            await truncate(chunkFilePath, 0)
        }
        await appendFile(chunkFilePath, chunk, this.articleUnicode)

        chunkStatus.chunksReceived++

        if (chunkStatus.timeoutId) {
            clearTimeout(chunkStatus.timeoutId)
        }

        if (chunkStatus.chunksReceived === totalChunks) {
            this.articleChunksStatus.delete(noteUniqueName)
            if (!result.isCreatedBefore) {
                await this.createNewArticle(noteUniqueName, chunkStatus.relativePath)
            }
        } else {
            chunkStatus.timeoutId = setTimeout(async () => {
                await this.cleanupArticleChunks(noteUniqueName)
            }, this.chunkStatusTimeout)
        }
    }

    private async cleanupArticleChunks(noteUniqueName: string): Promise<void> {
        const arr = Array.from(this.articleChunksStatus)
        for (const [key, value] of arr) {
            console.log('>>> item >>>', { item: key + ' - ' + value })
        }
        const chunkStatus = this.articleChunksStatus.get(noteUniqueName)!
        console.log('>>> chunk status to clean >>>', { chunkStatus })
        const articleFilePath = join(this.articlesDirPath, chunkStatus.relativePath, noteUniqueName)
        if (existsSync(articleFilePath)) {
            unlink(articleFilePath)
        }
        this.articleChunksStatus.delete(noteUniqueName)
    }
}
