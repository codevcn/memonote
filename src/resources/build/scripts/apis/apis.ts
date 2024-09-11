const ServerAPIURL: string = '/v1/api'

const axiosClient = axios.create({
    baseURL: ServerAPIURL,
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
const transcribeAudioAPI = (
    formDataWithFile: FormData,
): Promise<TAxiosHTTPRes<TTranscribeAudioResAPI>> =>
    axiosClient.post('/tools/transcribe-audio/' + getNoteUniqueNameFromURL(), formDataWithFile)
