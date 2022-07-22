import axios, { AxiosInstance } from "axios"


export const initApi = (): AxiosInstance => {
    const port: string = process.env.SERVICE_PORT || "53134"
    const baseurl = `http://${process.env.SERVICE_URL}:${port}`

    const instance = axios.create({
        baseURL: baseurl || 'ore-service-d:53134',
        timeout: 100000,
        headers: {'accept': 'application/json'}
    })
    return instance
}