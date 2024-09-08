import type { TSuccess } from '../utils/types.js'

export type TUploadIndentity = {
    uploadId: string
}

export type TArticleChunkStatus = {
    chunksReceived: number
    totalChunks: number
    relativePath: string
    docWasCreated: boolean
    timeoutId: NodeJS.Timeout | null
}

export type TCreateDirOfArticleChunk = {
    relativePath: string
    docWasCreated: boolean
    isFirstChunk: boolean
}

export type TWriteChunks = {
    docWasCreated: boolean
    chunkFilePathBackup: string
}

export type TUploadedImage = {
    imgURL: string
}

export type TPublishArticleReturn = TSuccess & {
    message?: string
}

export type TUploadImageReturn = TSuccess & {
    message?: string
    imgInfo?: TUploadedImage
}

export type TNumberOfImagesQuery = {
    numberOfImgs: number
}
