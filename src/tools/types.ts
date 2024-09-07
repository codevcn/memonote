export type TUploadIndentity = {
    uploadId: string
}

export type TAudioChunkStatus = {
    chunksReceived: number
    totalChunks: number
    relativePath: string
    timeoutId: NodeJS.Timeout | null
}

export type TCreateDirOfAudioChunk = {
    relativePath: string
    isFirstChunk: boolean
}
