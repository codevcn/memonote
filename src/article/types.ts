export type TArticleChunkStatus = {
    chunksReceived: number
    totalChunks: number
    timeoutId: NodeJS.Timeout | null
    relativePath: string
    isCreatedBefore: boolean
}

export type TcreateDirOfArticleChunk = {
    relativePath: string
    isCreatedBefore: boolean
}
