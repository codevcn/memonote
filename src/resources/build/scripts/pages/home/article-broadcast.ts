// init types, enums, ...
enum EArticleEvents {
    PUBLISH_ARTICLE = 'publish_article',
}

type TPublishArticleInChunksPyld = {
    totalChunks: number
    noteUniqueName: string
    noteId: string
    uploadId: string
}

// init socket
const articleSocket = io(`/${ENamespacesOfSocket.ARTICLE}`, clientSocketConfig)

let chunkIdx: number = 0
const publishArticleInChunks = (
    chunks: string[],
    chunkPayload: TPublishArticleInChunksPyld,
): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        articleSocket.emit(
            EArticleEvents.PUBLISH_ARTICLE,
            {
                ...chunkPayload,
                articleChunk: chunks[chunkIdx],
            },
            (res: TSuccess) => {
                if (res.success) {
                    chunkIdx++
                    if (chunkIdx < chunks.length - 1) {
                        publishArticleInChunks(chunks, chunkPayload)
                    } else {
                        resolve(true)
                    }
                } else {
                    chunkIdx = 0
                    reject(new BaseCustomError("Couldn't upload article"))
                }
            },
        )
    })
}
