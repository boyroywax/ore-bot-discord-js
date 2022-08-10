export interface Docket {
    dateCreated: Date
    creator: bigint | string
    docketNumber: number
    proposals: Proposal[]
    status: string
    endDate: Date
}

// 
// Interface for Proposal data
// 
export interface Proposal {
    // id?: number
    dateCreated: Date
    caseNumber: number
    title: string
    creator: bigint | string
    proposed: string
    selections: string[]
    changeVote: boolean
    endDate: Date
    status: string
    voteThreshold: number
    voteMinimum: number
    votes: Vote[]
    loadCase(caseNumber: number): Promise<boolean>
    saveCase(): Promise<boolean>
    updateCase(updatedProposal: {}): Promise<boolean>
    addVote(vote: Vote): Promise<boolean>
    loadCases({min, num}: {min: number, num: number}):Promise<Proposal[]>
    nextCaseNumber(): Promise<number>
    deleteCase(caseNum: number): Promise<boolean>
}

// 
// Interface for Votes
// 
export interface Vote {
    discordId: bigint | string
    oreId: string
    balanceAtVote: number
    voteSelection: string[]
    dateVoted: Date
    caseNumber: number
    voteWeight: number
    signed: string[]
    load({discordId, caseNumber}: {discordId: bigint, caseNumber: number}): Promise<boolean>
    save(): Promise<{ saved: boolean, savedVote: any }>
    update(updateVote: {}): Promise<boolean>
}