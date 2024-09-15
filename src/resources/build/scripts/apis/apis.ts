const serverAPIBaseURL: string = '/v1/api'

const axiosClient = axios.create({
    baseURL: serverAPIBaseURL,
})

// note
const setPasswordForNoteAPI = (
    password: string,
    logoutAll: boolean,
): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post('/note/set-password/' + getNoteUniqueNameFromURL(), { password, logoutAll })

const removePasswordForNoteAPI = (): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.delete('/note/remove-password/' + getNoteUniqueNameFromURL())

const switchEditorAPI = (editor: EEditors): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post('/note/switch-editor/' + getNoteUniqueNameFromURL(), { editor })

// auth
const logoutAPI = (): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post('/auth/logout/' + getNoteUniqueNameFromURL())

const signInAPI = (password: string): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post('/auth/sign-in/' + getNoteUniqueNameFromURL(), { password })

// notification
const getNotificationsAPI = (lastNotif?: TNotif): Promise<TAxiosHTTPRes<TGetNotificationsResAPI>> =>
    axiosClient.post(`/notification/${pageData.noteId}`, { lastNotif: lastNotif || {} })

// lang
const requestLangAPI = (langCode: string): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post(`/lang/request-lang`, { langCode })

// article
const fetchArticleAPI = (): Promise<TAxiosHTTPRes<Blob>> =>
    axiosClient.get(`/article/fetch-article/${pageData.noteId}`, { responseType: 'blob' })

// tools
const transcribeAudiosAPI = (
    formDataWithFile: FormData,
    callback: (transcription: TTranscribeAudiosResAPI) => void,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(
            'POST',
            serverAPIBaseURL + '/tools/transcribe-audio/' + getNoteUniqueNameFromURL(),
            true,
        )

        let receivedLength: number = 0
        xhr.onprogress = function () {
            const response = xhr.responseText
            const transcriptionChunk = response.substring(receivedLength)
            receivedLength = response.length
            const transcription = JSON.parse(transcriptionChunk) as TTranscribeAudiosResAPI
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
