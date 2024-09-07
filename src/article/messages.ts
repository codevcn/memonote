import { EArticleFiles } from './enums'

export enum EArticleMessages {
    ARTICLE_NOT_FOUND = 'Article was not found',
    MULTIPLE_UPLOAD = 'Cannot have multiple artilces uploaded at the same time',
    UPLOAD_IMAGE_FAIL = 'Fail to upload image',
    MAXIMUM_IMAGES_COUNT = `Maximum number of images is ${EArticleFiles.MAX_IMAGES_COUNT}`,
    EMPTY_IMAGES = 'Image list could not be empty',
}

export enum EFileServerMessages {
    UNABLE_HANDLED_FILE_INPUT = 'Unable handled file input',
    UNSUPPORTED_FILE_TYPE = 'Unsupported file type',
}
