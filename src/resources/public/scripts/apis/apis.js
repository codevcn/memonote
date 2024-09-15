'use strict'
const serverAPIBaseURL = '/v1/api'
const axiosClient = axios.create({
    baseURL: serverAPIBaseURL,
})
// note
const setPasswordForNoteAPI = (password, logoutAll) =>
    axiosClient.post('/note/set-password/' + getNoteUniqueNameFromURL(), { password, logoutAll })
const removePasswordForNoteAPI = () =>
    axiosClient.delete('/note/remove-password/' + getNoteUniqueNameFromURL())
const switchEditorAPI = (editor) =>
    axiosClient.post('/note/switch-editor/' + getNoteUniqueNameFromURL(), { editor })
// auth
const logoutAPI = () => axiosClient.post('/auth/logout/' + getNoteUniqueNameFromURL())
const signInAPI = (password) =>
    axiosClient.post('/auth/sign-in/' + getNoteUniqueNameFromURL(), { password })
// notification
const getNotificationsAPI = (lastNotif) =>
    axiosClient.post(`/notification/${pageData.noteId}`, { lastNotif: lastNotif || {} })
// lang
const requestLangAPI = (langCode) => axiosClient.post(`/lang/request-lang`, { langCode })
// article
const fetchArticleAPI = () =>
    axiosClient.get(`/article/fetch-article/${pageData.noteId}`, { responseType: 'blob' })
// tools
const transcribeAudiosAPI = (formDataWithFile, callback) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(
            'POST',
            serverAPIBaseURL + '/tools/transcribe-audio/' + getNoteUniqueNameFromURL(),
            true,
        )
        let receivedLength = 0
        xhr.onprogress = function () {
            const response = xhr.responseText
            const transcriptionChunk = response.substring(receivedLength)
            receivedLength = response.length
            const transcription = JSON.parse(transcriptionChunk)
            callback(transcription)
        }
        xhr.onloadend = function () {
            resolve()
        }
        xhr.onerror = function (error) {
            reject(error)
        }
        xhr.ontimeout = function (e) {
            reject(new BaseCustomError('Request timeout!'))
        }
        xhr.send(formDataWithFile)
    })
}
