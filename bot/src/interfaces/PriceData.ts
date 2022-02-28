// 
// Interface for CoinMarketCap price data
// 
export interface CmcPriceData {
    id?: number
    dateCreated: Date
    priceUSD: number
    priceBTC: number
    volumeBTC: number
    volumeETH: number
    volumeORE: number
    volumeUSD: number
    volumeChange24h: number
}