import axios from "axios"

import { logHandler } from "../utils/logHandler"
import { createPriceEntry, getLatestEntry } from "../utils/mongo"
import { CmcPriceData, CmcPrice } from "../interfaces/PriceData"
import { errorHandler } from "../utils/errorHandler"


const CMC_API_RESET_TIME: number = Number(process.env.CMC_API_RESET_TIME) || 260  // seconds

class CoinGecko implements CmcPriceData {
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
                baseURL: process.env.COINGECKO_API_ENDPOINT || 'https://api.coingecko.com',
                timeout: 1000,
                headers: {'accept': 'application/json'}
            })
        
            const apiData = await instance.get('/api/v3/coins/' + process.env.COINGECKO_API_ID, {
                params: {
                    tickers: true,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: false
                }
            })
            logHandler.info('Data retrieved from CoinGecko: ' + JSON.stringify(apiData.data))
        
            this.dateCreated = apiData.data['market_data']['timestamp']
            this.priceUSD = apiData.data['market_data']['current_price']['usd']
            this.volumeUSD = apiData.data['market_data']['total_volume']['usd']
            this.volumeChange24h = apiData.data['market_data']['price_change_percentage_24h']
            await createPriceEntry(this)
        }
        catch (err) {
            errorHandler("CoinGecko.getApiData()", err)           
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
            errorHandler("CoinGecko.getLocalData()", err)
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
            errorHandler("CoinGhecko.checkPrice()", err)
        }
    }
}

export async function getPriceData(): Promise<CmcPriceData> {
    let priceData: CmcPrice = new CoinGecko
    await priceData.checkPrice()
    return priceData
}