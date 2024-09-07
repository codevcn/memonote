import { Injectable } from '@nestjs/common'
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary'
import type { TUploadedImage } from './types.ts'
import { EArticleMessages, EFileServerMessages } from './messages.js'
import { InjectModel } from '@nestjs/mongoose'
import { Article, TArticleModel } from './article.model.js'
import { BaseCustomException } from '@/utils/exception/custom.exception.js'
import { Types } from 'mongoose'
import { ArticleService } from './article.service'
import { fileTypeFromBuffer } from 'file-type'
import { EArticleFiles } from './enums'

@Injectable()
export class FileServerService {
    private readonly artilceImgsPath: string = 'memonote/articles'
    static readonly supportedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
    ]

    constructor(
        @InjectModel(Article.name) private articleModel: TArticleModel,
        private articleService: ArticleService,
    ) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUDNAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }

    private createImgPath(notedId: string): string {
        return `${this.artilceImgsPath}/noteId-${notedId}`
    }

    async uploadImage(image: Buffer, notedId: string): Promise<TUploadedImage> {
        const imgInfo: UploadApiOptions = {
            use_filename: false,
            resource_type: 'image',
            folder: this.createImgPath(notedId),
        }
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(imgInfo, (error, uploadResult) => {
                    if (uploadResult) {
                        return resolve(uploadResult)
                    }
                    if (error) {
                        return reject(error)
                    }
                    reject(new BaseCustomException(EArticleMessages.UPLOAD_IMAGE_FAIL))
                })
                .end(image)
        })
        await this.articleService.addAnImageToDBHandler(result.public_id, notedId)
        return {
            imgURL: result.secure_url,
        }
    }

    convertURLListToPublicIds(currentURLList: string[]): string[] {
        return currentURLList.map((url) =>
            url.slice(url.search(this.artilceImgsPath), url.lastIndexOf('.')),
        )
    }

    async cleanupImages(currentURLList: string[], notedId: string): Promise<void> {
        const objectId = new Types.ObjectId(notedId)
        const article = await this.articleModel.findOne({ note: objectId }, { currentImages: true })
        if (!article) {
            throw new BaseCustomException(EArticleMessages.ARTICLE_NOT_FOUND)
        }
        const prePublicIds = article.currentImages
        if (prePublicIds && prePublicIds.length > 0) {
            const publicIds = this.convertURLListToPublicIds(currentURLList)
            const toCleanup = prePublicIds.filter((src) => !publicIds.includes(src))
            if (toCleanup && toCleanup.length > 0) {
                await cloudinary.api.delete_resources(toCleanup)
                await this.articleModel.updateOne(
                    { note: objectId },
                    {
                        $set: {
                            currentImages: publicIds,
                        },
                    },
                )
            }
        }
    }

    static async isValidImage(buffer: Buffer): Promise<boolean> {
        if (buffer.byteLength > EArticleFiles.MAX_IMAGE_SIZE) {
            throw new BaseCustomException(EFileServerMessages.UNABLE_HANDLED_FILE_INPUT)
        }
        const fileType = await fileTypeFromBuffer(buffer)
        if (!fileType) {
            throw new BaseCustomException(EFileServerMessages.UNABLE_HANDLED_FILE_INPUT)
        }
        const isValid = this.supportedImageTypes.includes(fileType.mime)
        if (!isValid) {
            throw new BaseCustomException(EFileServerMessages.UNSUPPORTED_FILE_TYPE)
        }
        return true
    }

    static async validateImgSrcList(imgURLs: string[]): Promise<boolean> {
        const lenOfList = imgURLs.length
        if (lenOfList === 0) {
            throw new BaseCustomException(EArticleMessages.EMPTY_IMAGES)
        }
        if (lenOfList > EArticleFiles.MAX_IMAGES_COUNT) {
            throw new BaseCustomException(EArticleMessages.MAXIMUM_IMAGES_COUNT)
        }
        return true
    }
}
