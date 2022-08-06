import { initApi } from "./apiCall"


export const getProposal = async ( caseNumber: number ): Promise<{ 
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
}> => {
    let response = {
        dateCreated: new Date,
        caseNumber: 0,
        title: "None",
        creator: "0",
        proposed: "Proposal",
        selections: ["Yes", "No"],
        changeVote: false,
        endDate: new Date(new Date().valueOf() + (144 * 60 * 60 * 1000 )),
        status: "None",
        voteThreshold: 50.00,
        voteMinimum: 100.00
    }
    try {
        const instance = initApi()
    
        const apiData = await instance.post(
            '/proposal?case=' + String( caseNumber ),
            { "action": "get" }
        )
        console.log('Data retrieved from Service: ' + JSON.stringify( apiData.data ))
        response = {...apiData.data}
    }
    catch (err) {
        console.error("getProposal", err)           
    }
    return response
}