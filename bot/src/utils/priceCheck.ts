import axios from "axios"

import { logHandler } from "./logHandler"
import { createPriceEntry, getLatestEntry } from "../modules/mongo"
import { CmcPriceData, CmcPrice } from "../interfaces/PriceData"
import { errorHandler } from "../utils/errorHandler"


const CMC_API_RESET_TIME: number = Number(process.env.CMC_API_RESET_TIME) || 260  // seconds

class Cmc implements CmcPriceData {
    id?: number
    dateCreated: Date = new Date
    priceUSD: number = 0.0
    priceBTC: number = 0.0
    volumeBTC: number = 0.0
    volumeETH: number = 0.0
    volumeORE: number = 0.0
    volumeUSD: number = 0.0
    volumeChange24h: number = 0.0

    constructor() {
       //
    }

    private async getApiData(): Promise<void> {
        try {
            const instance = axios.create({
                baseURL: process.env.CMC_API_ENDPOINT || 'https://pro-api.coinmarketcap.com',
                timeout: 1000,
                headers: {'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY || 'NoKey'}
            })
        
            const apiData = await instance.get('/v1/cryptocurrency/quotes/latest', {
                params: {
                    slug: 'ore-network'
                }
            })
            logHandler.info('Data retrieved from CMC: ' + JSON.stringify(apiData.data))
        
            this.dateCreated = apiData.data['status']['timestamp']
            this.priceUSD = apiData.data['data']['12743']['quote']['USD']['price']
            this.volumeUSD = apiData.data['data']['12743']['quote']['USD']['volume_24h']
            this.volumeChange24h = apiData.data['data']['12743']['quote']['USD']['percent_change_24h']
            await createPriceEntry(this)
        }
        catch (err) {
            errorHandler("Cmc.getApiData()", err)           
        }
    }

    private async getLocalData(): Promise<void> {
        try {
            const localData: CmcPriceData = await getLatestEntry()

            this.dateCreated = localData.dateCreated
            this.priceUSD = localData.priceUSD
            this.volumeUSD = localData.volumeUSD
            this.volumeChange24h = localData.volumeChange24h
        }
        catch (err) {
            errorHandler("Cmc.getLocalData()", err)
        }
    }

    private async isExpired(): Promise<boolean> {
        let isExpired: boolean = false
        try {
            await this.getLocalData()
            const currentDate: number = Date.now()
            const localDataDate: number = this.dateCreated.valueOf()
            const lastResultDate: number = currentDate - localDataDate

            if (lastResultDate >= CMC_API_RESET_TIME) {
                isExpired = true
            }
        }
        catch (err) {
            isExpired = true
        }
        finally {
            return isExpired
        }
    }

    public async checkPrice(): Promise<void> {
        try {
            const isExpired = await this.isExpired()

            if (isExpired) {
                await this.getApiData()
            }
        }
        catch (err) {
            errorHandler("Cmc.checkPrice()", err)
        }
    }
}

export async function getLocalPriceData(): Promise<CmcPriceData> {
    let priceData: CmcPrice = new Cmc
    await priceData.checkPrice()
    return priceData
}