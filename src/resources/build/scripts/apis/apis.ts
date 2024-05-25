// note
const setPasswordOfNoteAPI = (password: string, noteUniqueName: string): Promise<TResBodySuccess> =>
    axiosClient.post('/note/set-password/' + noteUniqueName + '?myVar=234', { password })

const removePasswordOfNoteAPI = (noteUniqueName: string): Promise<TResBodySuccess> =>
    axiosClient.delete('/note/remove-password/' + noteUniqueName)

// auth
const logoutAPI = (noteUniqueName: string): Promise<TResBodySuccess> =>
    axiosClient.post('/auth/logout/' + noteUniqueName)
