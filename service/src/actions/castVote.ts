import { VoteModel } from "../models/VoterDataModel"
import { errorLogger } from "../utils/logHandler"
import { Vote } from "../interfaces/VoterData"
import { Document } from "mongoose"


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
        discordId?: bigint | string,
        oreId?: string,
        balanceAtVote?: number,
        voteSelection?: string[],
        dateVoted?: Date,
        caseNumber?: number,
        voteWeight?: number,
        signed?: string[],
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

    public async load({discordId, caseNumber}: { discordId: bigint, caseNumber: number }): Promise<boolean> {
        let loadComplete: boolean = false
        try{
            const vote: Vote | null = await VoteModel.findOne({
                "discordId": discordId,
                "caseNumber": caseNumber
            })
            if (vote !== null) {
                this.discordId = vote.discordId
                this.oreId = vote.oreId
                this.balanceAtVote = vote.balanceAtVote
                this.voteSelection = vote.voteSelection
                this.dateVoted = vote.dateVoted
                this.caseNumber = vote.caseNumber
                this.voteWeight = vote.voteWeight
                this.signed = vote.signed
                loadComplete = true
            }
        }
        catch (err) {
            errorLogger("UserVote.load", err)
        }
        return loadComplete
    }

    public async save(): Promise<{saved: boolean, savedDoc: any}> {
        let saved: boolean = false
        let savedDoc: any | null = null
        try {
            const savedVote: Document | null = await VoteModel.findOne({
                "discordId": this.discordId,
                "caseNumber": this.caseNumber
            })
            if (savedVote !== null) {
                savedDoc = await VoteModel.updateOne({
                    "discordId": this.discordId,
                    "caseNumber": this.caseNumber
                }, this)
            }
            else {
                savedDoc = await VoteModel.create(this)
            }
        }
        catch (err) {
            errorLogger("UserVote.save", err)
        }
        return { saved, savedDoc }
    }

    public async update( updatedVote: {
        discordId: bigint | string,
        oreId?: string,
        balanceAtVote?: number,
        voteSelection?: string[],
        dateVoted?: Date,
        caseNumber: number,
        voteWeight?: number,
        signed?: string[],
    }) : Promise<boolean> {
        let updateComplete: boolean = false
        try {
            if ((updatedVote.discordId === this.discordId)
            && (updatedVote.caseNumber === this.caseNumber)) {
                const vote: Vote | null = await VoteModel.findOne({
                    "discordId": this.discordId,
                    "caseNumber": this.caseNumber
                })
                if (vote !== null) {
                    this.oreId = updatedVote.oreId || vote.oreId
                    this.balanceAtVote = updatedVote.balanceAtVote || vote.balanceAtVote
                    this.voteSelection = updatedVote.voteSelection || vote.voteSelection
                    this.dateVoted = updatedVote.dateVoted || vote.dateVoted
                    this.voteWeight = updatedVote.voteWeight || vote.voteWeight
                    this.signed = updatedVote.signed || vote.signed

                    const saved = await this.save()
                    if (saved) {
                        updateComplete = true
                    }
                }
            }
        }
        catch (err) {
            errorLogger("UserVote.update", err)
        }
        return updateComplete
    }
}