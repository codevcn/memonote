'use strict'
const ServerAPIURL = '/v1/api'
const axiosClient = axios.create({
    baseURL: ServerAPIURL,
})
// note
const setPasswordOfNoteAPI = (password, noteUniqueName) =>
    axiosClient.post('/note/set-password/' + noteUniqueName + '?myVar=234', { password })
const removePasswordOfNoteAPI = (noteUniqueName) =>
    axiosClient.delete('/note/remove-password/' + noteUniqueName)
// auth
const logoutAPI = (noteUniqueName) => axiosClient.post('/auth/logout/' + noteUniqueName)
const signInAPI = (password, noteUniqueName) =>
    axiosClient.post('/auth/sign-in/' + noteUniqueName, { password })
