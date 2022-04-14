import axios from "axios"

import { logHandler } from "../utils/logHandler"
import { createPriceEntry, getLatestEntry } from "../utils/mongo"
import { PriceData } from "../interfaces/PriceData"
import { errorHandler } from "../utils/errorHandler"


const CMC_API_RESET_TIME: number = Number(process.env.CMC_API_RESET_TIME) || 260  // seconds

class Price implements PriceData {
    id?: number
    dateCreated: Date = new Date
    priceUSD: number = 0.0
    priceBTC: number = 0.0
    volumeBTC: number = 0.0
    volumeETH: number = 0.0
    volumeORE: number = 0.0
    volumeUSD: number = 0.0
    priceChange24h: number = 0.0

    constructor() {
       //
    }

    private async getApiDataCG(): Promise<void> {
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
        
            this.dateCreated = apiData.data['market_data']['timestamp'] || new Date
            this.priceUSD = apiData.data['market_data']['current_price']['usd']
            this.volumeUSD = apiData.data['market_data']['total_volume']['usd']
            this.priceChange24h = apiData.data['market_data']['price_change_percentage_24h']
            await createPriceEntry(this)
        }
        catch (err) {
            errorHandler("CoinGecko.getApiData()", err)           
        }
    }

    private async getApiDataCMC(): Promise<void> {
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
            this.priceChange24h = apiData.data['data']['12743']['quote']['USD']['percent_change_24h']
            await createPriceEntry(this)
        }
        catch (err) {
            errorHandler("Cmc.getApiData()", err)           
        }
    }

    private async getLocalData(): Promise<void> {
        try {
            const localData: PriceData = await getLatestEntry()

            this.dateCreated = localData.dateCreated
            this.priceUSD = localData.priceUSD
            this.volumeUSD = localData.volumeUSD
            this.priceChange24h = localData.priceChange24h
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

    public async checkPrice(source: string): Promise<void> {
        try {
            const isExpired = await this.isExpired()

            if (isExpired) {
                if (source == 'coingecko') {
                    await this.getApiDataCG()
                }
                else if (source == 'cmc') {
                    await this.getApiDataCMC()
                }
            }
        }
        catch (err) {
            errorHandler("CoinGhecko.checkPrice()", err)
        }
    }
}

export async function getPriceData(source: string): Promise<PriceData> {
    let priceData: Price = new Price
    await priceData.checkPrice(source)
    return priceData
}