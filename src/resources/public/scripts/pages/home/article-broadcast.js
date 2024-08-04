'use strict'
// init types, enums, ...
var EArticleEvents
;(function (EArticleEvents) {
    EArticleEvents['PUBLISH_ARTICLE'] = 'publish_article'
})(EArticleEvents || (EArticleEvents = {}))
// init socket
const articleSocket = io(`/${ENamespacesOfSocket.ARTICLE}`, clientSocketConfig)
let chunkIdx = 0
const publishArticleInChunks = (chunks, chunkPayload) => {
    return new Promise((resolve, reject) => {
        articleSocket.emit(
            EArticleEvents.PUBLISH_ARTICLE,
            Object.assign(Object.assign({}, chunkPayload), { articleChunk: chunks[chunkIdx] }),
            (res) => {
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
