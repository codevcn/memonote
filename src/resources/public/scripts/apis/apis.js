'use strict'
const ServerAPIURL = '/v1/api'
const axiosClient = axios.create({
    baseURL: ServerAPIURL,
})
// note
const setPasswordForNoteAPI = (password, logoutAll, noteUniqueName) =>
    axiosClient.post('/note/set-password/' + noteUniqueName, { password, logoutAll })
const removePasswordForNoteAPI = (noteUniqueName) =>
    axiosClient.delete('/note/remove-password/' + noteUniqueName)
// auth
const logoutAPI = (noteUniqueName) => axiosClient.post('/auth/logout/' + noteUniqueName)
const signInAPI = (password, noteUniqueName) =>
    axiosClient.post('/auth/sign-in/' + noteUniqueName, { password })
// notification
const getNotificationsAPI = (noteId, page) => axiosClient.get(`/notification?n=${noteId}&p=${page}`)
