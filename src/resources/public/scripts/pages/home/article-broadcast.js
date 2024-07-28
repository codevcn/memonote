'use strict'
// init types, enums, ...
var EArticleEvents
;(function (EArticleEvents) {
    EArticleEvents['PUBLISH_ARTICLE'] = 'publish_article'
})(EArticleEvents || (EArticleEvents = {}))
// init socket
const articleSocket = io(`/${ENamespacesOfSocket.ARTICLE}`, clientSocketConfig)
const publishArticleInChunks = (chunkPayload) => {
    console.log('>>> chunk Payload >>>', { chunkPayload })
    return new Promise((resolve, reject) => {
        articleSocket.emit(EArticleEvents.PUBLISH_ARTICLE, chunkPayload, (res) => {
            if (res.success) {
                resolve(true)
            } else {
                reject(new BaseCustomError("Couldn't upload chunks"))
            }
        })
    })
}
