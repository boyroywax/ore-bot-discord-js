import { Vote } from "../interfaces/VoterData"


export class UserVote implements Vote {
    discordId: bigint | string = "None"
    oreId: string = "None"
    balanceAtVote: number = 0.00
    voteSelection: string[] = ["No"]
    dateVoted: Date = new Date
    caseNumber: number = 0
    voteWeight: number = 0.00
    signed: string[] = ["NoSignedString"]

    constructor({
        discordId,
        oreId,
        balanceAtVote,
        voteSelection,
        dateVoted,
        caseNumber,
        voteWeight,
        signed
    }: {
        discordId: bigint | string,
        oreId: string,
        balanceAtVote: number,
        voteSelection: string[],
        dateVoted: Date,
        caseNumber: number,
        voteWeight: number,
        signed: string[],
    }) {
        this.discordId = discordId || this.discordId
        this.oreId = oreId || this.oreId
        this.balanceAtVote = balanceAtVote || this.balanceAtVote
        this.voteSelection = voteSelection || this.voteSelection
        this.dateVoted = dateVoted || this.dateVoted
        this.caseNumber = caseNumber || this.caseNumber
        this.voteWeight = voteWeight || this.voteWeight
        this.signed = signed || this.signed
    }


}