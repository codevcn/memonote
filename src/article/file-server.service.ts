import { Injectable } from '@nestjs/common'
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary'
import type { TUploadedImage } from './types'
import { WsException } from '@nestjs/websockets'
import { EArticleMessages } from './messages'
import { InjectModel } from '@nestjs/mongoose'
import { Article, TArticleModel } from './article.model'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { Types } from 'mongoose'
import { validateImgList } from './validation'

@Injectable()
export class FileServerService {
    private readonly artilceImgsPath: string = 'memonote/articles'

    constructor(@InjectModel(Article.name) private articleModel: TArticleModel) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUDNAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }

    private createImgPath(notedId: string): string {
        return `${this.artilceImgsPath}/noteId-${notedId}`
    }

    async uploadImage(image: ArrayBuffer, notedId: string): Promise<TUploadedImage> {
        const imgInfo: UploadApiOptions = {
            use_filename: false,
            resource_type: 'image',
            folder: this.createImgPath(notedId),
        }
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(imgInfo, (error, uploadResult) => {
                    if (uploadResult) {
                        console.log('>>> upload result >>>', { uploadResult })
                        return resolve(uploadResult)
                    }
                    if (error) {
                        return reject(error)
                    }
                    reject(new WsException(EArticleMessages.UPLOAD_IMAGE_FAIL))
                })
                .end(image)
        })
        await this.addAnImageToDB(result.public_id, notedId)
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
        await validateImgList(currentURLList)
        const article = await this.articleModel.findOne(
            { note: new Types.ObjectId(notedId) },
            { currentImages: true },
        )
        console.log('>>> artcile after finding >>>', { article })
        if (!article) throw new BaseCustomException(EArticleMessages.ARTICLE_NOT_FOUND)
        const prePublicIds = article.currentImages
        if (prePublicIds && prePublicIds.length > 0) {
            const publicIds = this.convertURLListToPublicIds(currentURLList)
            const toCleanup = prePublicIds.filter((src) => !publicIds.includes(src))
            if (toCleanup && toCleanup.length > 0) {
                await cloudinary.api.delete_resources(toCleanup)
            }
        }
    }

    async addAnImageToDB(publicId: string, notedId: string): Promise<void> {
        await this.articleModel.updateOne(
            { note: new Types.ObjectId(notedId) },
            {
                $push: {
                    currentImages: publicId,
                },
            },
        )
    }
}
