// init types, enums, ...
enum EArticleEvents {
    PUBLISH_ARTICLE = 'publish_article',
}

type TPublishArticleInChunksPyld = {
    articleChunk: string
    totalChunks: number
    noteUniqueName: string
    noteId: string
}

// init socket
const articleSocket = io(`/${ENamespacesOfSocket.ARTICLE}`, clientSocketConfig)

const publishArticleInChunks = (chunkPayload: TPublishArticleInChunksPyld): Promise<boolean> => {
    console.log('>>> chunk Payload >>>', { chunkPayload })
    return new Promise<boolean>((resolve, reject) => {
        articleSocket.emit(EArticleEvents.PUBLISH_ARTICLE, chunkPayload, (res: TSuccess) => {
            if (res.success) {
                resolve(true)
            } else {
                reject(new BaseCustomError("Couldn't upload chunks"))
            }
        })
    })
}
