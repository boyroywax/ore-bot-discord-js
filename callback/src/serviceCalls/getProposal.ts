import { initApi } from "./apiCall"


export const getProposal = async ( caseNumberPassed: number ): Promise<{ 
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
    voteMinimum: number,
    votes: any[]
}> => {
    let response = {
        dateCreated: new Date,
        caseNumber: 0,
        title: "None",
        creator: "None",
        proposed: "Proposal",
        selections: ["Yes", "No"],
        changeVote: false,
        endDate: new Date(new Date().valueOf() + (144 * 60 * 60 * 1000 )),
        status: "None",
        voteThreshold: 50.00,
        voteMinimum: 100.00,
        votes: [{}]
    }
    try {
        const instance = initApi()
    
        const apiData = await instance.post(
            '/proposal?case=' + String( caseNumberPassed ),
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