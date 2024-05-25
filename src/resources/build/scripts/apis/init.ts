const ServerAPIURL: string = 'http://localhost:8080/v1/api'

const axiosClient = axios.create({
    baseURL: ServerAPIURL,
})
