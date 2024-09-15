import bytes from 'bytes'

export enum EArticleChunk {
    SIZE_PER_CHUNK = bytes('5MB'),
}

export enum EArticleEvents {
    PUBLISH_ARTICLE = 'publish_article',
    UPLOAD_IMAGE = 'upload_image',
}

export enum EArticleFiles {
    MAX_IMAGE_SIZE = bytes('3MB'),
    MAX_IMAGES_COUNT = 10,
}
