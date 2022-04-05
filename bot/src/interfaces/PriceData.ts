// 
// Interface for CoinMarketCap price data
// 
export interface PriceData {
    // id?: number
    dateCreated: Date
    priceUSD: number
    priceBTC: number
    volumeBTC: number
    volumeETH: number
    volumeORE: number
    volumeUSD: number
    priceChange24h: number
}


export interface Price extends PriceData {
    checkPrice(source: string): Promise<void>
    // getApiData(): Promise<void>
    // getLocalData(): Promise<void>
    // isExpired(): Promise<boolean>
}