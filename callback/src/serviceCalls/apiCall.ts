import axios, { AxiosInstance } from "axios"


export const initApi = (): AxiosInstance => {
    const baseurl = `http://${process.env.REACT_APP_API_SERVICE_URL}`

    const instance = axios.create({
        baseURL: baseurl,
        timeout: 100000,
        headers: {'accept': 'application/json'}
    })
    return instance
}