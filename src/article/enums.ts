import bytes from 'bytes'

export enum EArticleChunk {
    SIZE_PER_CHUNK = bytes('1MB'),
}

export enum EArticleEvents {
    PUBLISH_ARTICLE = 'publish_article',
    UPLOAD_IMAGE = 'upload_image',
}

export enum EArticleFiles {
    MAX_IMAGE_SIZE = bytes('1MB'),
    MAX_IMAGES_COUNT = 10,
}
