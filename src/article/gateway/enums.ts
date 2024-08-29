import bytes from 'bytes'

export enum EArticleEvents {
    PUBLISH_ARTICLE = 'publish_article',
    UPLOAD_IMAGE = 'upload_image',
}

export enum EFileSize {
    MAX_IMAGE_SIZE = bytes('1MB'),
}
