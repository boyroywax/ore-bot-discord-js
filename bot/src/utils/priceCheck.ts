import axios, { AxiosResponse } from "axios"

import { logHandler } from "./logHandler"
import { createPriceEntry, getLatestEntry } from "../modules/mongo"
import { CmcPriceData } from "../interfaces/PriceData"
import { PriceDataModel } from "../models/PriceDataModel"
import { errorHandler } from "../utils/errorHandler"


const CMC_API_RESET_TIME: number = Number(process.env.CMC_API_RESET_TIME) || 260  // secsonds


export async function getCmcData(): Promise<AxiosResponse> {
    const instance = axios.create({
        baseURL: process.env.CMC_API_ENDPOINT || 'https://pro-api.coinmarketcap.com',
        timeout: 1000,
        headers: {'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY || 'NoKey'}
      })

    const currentData = await instance.get('/v1/cryptocurrency/quotes/latest', {
        params: {
            slug: 'ore-network'
        }
    })
    logHandler.info('Data retrieved from CMC: ' + JSON.stringify(currentData.data))

    return currentData
}

export function getOrePriceUSD(currentData: AxiosResponse): number {
    return currentData.data['data']['12743']['quote']['USD']['price']
}

export function getOreVolume24h(currentData: AxiosResponse): number {
    return currentData.data['data']['12743']['quote']['USD']['volume_24h']
}

export function getOreVolume24hChange(currentData: AxiosResponse): number {
    return currentData.data['data']['12743']['quote']['USD']['percent_change_24h']
}


export async function getLocalPriceData(): Promise<CmcPriceData> {

    const currentTime = new Date
    let priceData: CmcPriceData = new PriceDataModel


    const latestEntry: CmcPriceData = await getLatestEntry()
    if (!latestEntry.dateCreated) {
        priceData = await createPriceEntry(currentTime)
    }
    else {
        // item.itemId is the max value
        logHandler.info(JSON.stringify(latestEntry))
        if (currentTime.valueOf() - ( latestEntry?.dateCreated.valueOf() || currentTime.valueOf() ) <= (CMC_API_RESET_TIME)) { 
            priceData = latestEntry
        }
        else {
            priceData = await createPriceEntry(currentTime)
        }
    }

    return priceData
}