'use strict'
const ServerAPIURL = 'http://localhost:8080/v1/api'
const axiosClient = axios.create({
    baseURL: ServerAPIURL,
})
