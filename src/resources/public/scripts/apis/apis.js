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
// const transcribeAudioAPI = (
//     formDataWithFile: FormData,
// ): Promise<TAxiosHTTPRes<TTranscribeAudiosResAPI>> =>
//     axiosClient.post('/tools/transcribe-audio/' + getNoteUniqueNameFromURL(), formDataWithFile)
const transcribeAudioAPI = async (formDataWithFile) => {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, 2000)
    })
    return {
        data: {
            confidence: 0.99,
            paragraphs: [{ sentences: ['anh la', 'mot', 'thang ngoc'], wordsCount: 5 }],
            transcription: 'anh la mot thang ngoc',
        },
    }
}
