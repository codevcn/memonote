const ServerAPIURL: string = '/v1/api'

const axiosClient = axios.create({
    baseURL: ServerAPIURL,
})

type TGetNotifications = {
    notifs: TNotifData[]
    isEnd: boolean
}

// note
const setPasswordForNoteAPI = (
    password: string,
    logoutAll: boolean,
    noteUniqueName: string,
): Promise<TSuccess> =>
    axiosClient.post('/note/set-password/' + noteUniqueName, { password, logoutAll })

const removePasswordForNoteAPI = (noteUniqueName: string): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.delete('/note/remove-password/' + noteUniqueName)

const switchEditorAPI = (noteUniqueName: string, editor: EEditors) =>
    axiosClient.post('/note/switch-editor/' + noteUniqueName, { editor })

// auth
const logoutAPI = (noteUniqueName: string): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post('/auth/logout/' + noteUniqueName)

const signInAPI = (password: string, noteUniqueName: string): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post('/auth/sign-in/' + noteUniqueName, { password })

// notification
const getNotificationsAPI = (
    noteId: string,
    lastNotif?: TNotif,
): Promise<TAxiosHTTPRes<TGetNotifications>> =>
    axiosClient.post(`/notification/${noteId}`, { lastNotif: lastNotif || {} })

// lang
const requestLangAPI = (langCode: string): Promise<TAxiosHTTPRes<TSuccess>> =>
    axiosClient.post(`/lang/request-lang`, { langCode })

// article
const fetchArticleAPI = (noteId: string): Promise<TAxiosHTTPRes<Blob>> =>
    axiosClient.get(`/article/fetch-article/${noteId}`, { responseType: 'blob' })
