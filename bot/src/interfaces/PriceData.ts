// 
// Interface for CoinMarketCap price data
// 
export interface CmcPriceData {
    // id?: number
    dateCreated: Date
    priceUSD: number
    priceBTC: number
    volumeBTC: number
    volumeETH: number
    volumeORE: number
    volumeUSD: number
    volumeChange24h: number
}


export interface CmcPrice extends CmcPriceData {
    checkPrice(): Promise<void>
    // getApiData(): Promise<void>
    // getLocalData(): Promise<void>
    // isExpired(): Promise<boolean>
}