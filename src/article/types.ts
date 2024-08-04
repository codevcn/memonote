export type TArticleChunkStatus = {
    chunksReceived: number
    totalChunks: number
    timeoutId: NodeJS.Timeout | null
    relativePath: string
    docWasCreated: boolean
    uploadId: string
}

export type TcreateDirOfArticleChunk = {
    relativePath: string
    docWasCreated: boolean
}

export type TWriteChunks = {
    resultOfCreateDir: TcreateDirOfArticleChunk
    chunkFilePathBackup: string
}
