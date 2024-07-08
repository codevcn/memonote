const ServerAPIURL: string = '/v1/api'

const axiosClient = axios.create({
    baseURL: ServerAPIURL,
})

// note
const setPasswordOfNoteAPI = (
    password: string,
    logoutAll: boolean,
    noteUniqueName: string,
): Promise<TResBodySuccess> =>
    axiosClient.post('/note/set-password/' + noteUniqueName + '?myVar=234', { password, logoutAll })

const removePasswordOfNoteAPI = (noteUniqueName: string): Promise<TAxiosHTTPRes<TResBodySuccess>> =>
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
const getNotificationsAPI = (noteId: string): Promise<TAxiosHTTPRes<TNotif[]>> =>
    axiosClient.get('/notification/' + noteId)
