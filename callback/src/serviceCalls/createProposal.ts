import { initApi } from "./apiCall";

export const createProposal = async ({ 
    dateCreated,
    caseNumber,
    title,
    creator,
    proposed,
    selections,
    changeVote,
    endDate,
    status,
    voteThreshold,
    voteMinimum
}: { 
    dateCreated: Date,
    caseNumber: number,
    title: string,
    creator: bigint | string,
    proposed: string,
    selections: string[],
    changeVote: boolean,
    endDate: Date,
    status: string,
    voteThreshold: number,
    voteMinimum: number
}): Promise<boolean> => {
    let result = false
    try {
        const instance = initApi()
    
        const apiData = await instance.post(
            '/proposal?case=' + String( caseNumber ),
            { "action": "new",
                "data": { 
                    dateCreated,
                    caseNumber,
                    title,
                    creator,
                    proposed,
                    selections,
                    changeVote,
                    endDate,
                    status,
                    voteThreshold,
                    voteMinimum
                }
            }
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        result = apiData.data
    }
    catch (err) {
        console.error("createProposal", err)
    }
    return result
}