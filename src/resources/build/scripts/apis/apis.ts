const ServerAPIURL: string = '/v1/api'

const axiosClient = axios.create({
    baseURL: ServerAPIURL,
})

type TGetNotifications = {
    notifs: TNotif[]
    totalNumber: number
}

// note
const setPasswordForNoteAPI = (
    password: string,
    logoutAll: boolean,
    noteUniqueName: string,
): Promise<TResBodySuccess> =>
    axiosClient.post('/note/set-password/' + noteUniqueName, { password, logoutAll })

const removePasswordForNoteAPI = (
    noteUniqueName: string,
): Promise<TAxiosHTTPRes<TResBodySuccess>> =>
    axiosClient.delete('/note/remove-password/' + noteUniqueName)

// auth
const logoutAPI = (noteUniqueName: string): Promise<TAxiosHTTPRes<TResBodySuccess>> =>
    axiosClient.post('/auth/logout/' + noteUniqueName)

const signInAPI = (
    password: string,
    noteUniqueName: string,
): Promise<TAxiosHTTPRes<TResBodySuccess>> =>
    axiosClient.post('/auth/sign-in/' + noteUniqueName, { password })

// notification
const getNotificationsAPI = (
    noteId: string,
    page: number,
): Promise<TAxiosHTTPRes<TGetNotifications>> =>
    axiosClient.get(`/notification?n=${noteId}&p=${page}`)
