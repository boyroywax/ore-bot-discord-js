import axios, { AxiosInstance } from "axios"


export const initApi = (): AxiosInstance => {
    const port: string = process.env.REACT_APP_API_SERVICE_PORT || "53134"
    const baseurl = `http://${process.env.REACT_APP_API_SERVICE_URL}`

    const instance = axios.create({
        baseURL: baseurl || 'http://ore-service-d:53134',
        timeout: 100000,
        headers: {'accept': 'application/json'}
    })
    return instance
}