// 
// Interface for ORE Balance
// 

export interface OreBalance {
    oreId: string
    oreBalance: number
    pending?: number  // Amount fo funds pending
    status: string
    message: string
    publicKey: string
}

// 
// Interface for an ORE Network Block
// 

// 
// Interface for an ORE Network Transaction
// 