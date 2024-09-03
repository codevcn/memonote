import { Injectable } from '@nestjs/common'
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary'
import type { TUploadedImage } from './types'
import { EArticleMessages } from './messages'
import { InjectModel } from '@nestjs/mongoose'
import { Article, TArticleModel } from './article.model'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { Types } from 'mongoose'
import { validateInputImgList } from './validation'
import { ArticleService } from './article.service'

@Injectable()
export class FileServerService {
    private readonly artilceImgsPath: string = 'memonote/articles'

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
        await validateInputImgList(currentURLList)
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
}
