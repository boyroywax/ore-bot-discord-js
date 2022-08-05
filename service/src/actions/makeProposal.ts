import { debugLogger, errorLogger, eventLogger } from "../utils/logHandler"
import { Vote, Proposal, Docket } from "../interfaces/VoterData"
import { ProposalModel } from "../models/VoterDataModel"
import { Document } from "mongoose"


export class Proposals implements Proposal {
    dateCreated: Date = new Date
    caseNumber: number = 0
    title: string = "Title"
    creator: bigint | string = "None"
    proposed: string = "Proposed"
    selections: string[] = ["Yes", "No"]
    changeVote: boolean = false
    endDate: Date = new Date(this.dateCreated.valueOf() + (148 * 60 * 60 * 1000 ))
    status: string = "None"
    voteThreshold: number = 50.0
    voteMinimum: number = 100.0
    votes: Vote[] = []

    constructor(
        title?: string,
        creator?: bigint | string,
        proposed?: string,
        selections?: string[],
        changeVote?: boolean,
        endDate?: Date,
        status?: string,
        voteThreshold?: number,
        voteMinimum?: number
    ) {
        this.title = title || this.title
        this.creator = creator || this.creator
        this.proposed = proposed || this.proposed
        this.selections = selections || this.selections
        this.changeVote = changeVote || this.changeVote
        this.endDate = endDate || this.endDate
        this.status = status || this.status
        this.voteThreshold = voteThreshold || this.voteThreshold
        this.voteMinimum = voteMinimum || this.voteMinimum
    }

    public async loadCase( caseNumber: number ): Promise<boolean> {
        let loadComplete: boolean = false
        try {
            const proposal: Proposal | null = await ProposalModel.findOne({"caseNumber": caseNumber}).exec() 

            if (proposal !== null ) {
                this.dateCreated = proposal.dateCreated
                this.caseNumber = proposal.caseNumber
                this.title = proposal.title
                this.creator = proposal.creator
                this.proposed = proposal.proposed
                this.selections = proposal.selections
                this.changeVote = proposal.changeVote
                this.endDate = proposal.endDate
                this.status = proposal.status
                this.voteThreshold = proposal.voteThreshold
                this.voteMinimum = proposal.voteMinimum
                this.votes = proposal.votes
                loadComplete = true
            }
        }
        catch (err) {
            errorLogger("Porposals.load()", err)
        }
        return loadComplete
    }

    public async saveCase(): Promise<boolean> {
        let saved: boolean = false
        try {
            let savedProposal: Document | null = await ProposalModel.findOne({"caseNumber": this.caseNumber})
            if (savedProposal !== null) {
                await ProposalModel.updateOne({"caseNumber": this.caseNumber}, this as Proposal)
            }
            else {
                await ProposalModel.create(this as Proposal)
            }
            saved = true
        }
        catch (err) {
            errorLogger("Proposals.saveCase()", err)
        }
        finally {
            return saved
        }
    }

    public async updateCase( updatedProposal: {
        caseNumber: number,
        title?: string,
        creator?: bigint | string,
        proposed?: string,
        selections?: string[],
        changeVote?: boolean,
        endDate?: Date,
        status?: string,
        voteThreshold?: number,
        voteMinimum?: number,
    }): Promise<boolean> {
        let updateComplete = false
        try {
            const proposal: Proposal | null = await ProposalModel.findOne({"caseNumber": updatedProposal.caseNumber})

            if (proposal !== null) {
                this.title = updatedProposal.title || proposal.title
                this.creator = updatedProposal.creator || proposal.creator
                this.proposed = updatedProposal.proposed || proposal.proposed
                this.selections = updatedProposal.selections || proposal.selections
                this.changeVote = updatedProposal.changeVote || proposal.changeVote
                this.endDate = updatedProposal.endDate || proposal.endDate
                this.status = updatedProposal.status || proposal.status
                this.voteThreshold = updatedProposal.voteThreshold || proposal.voteThreshold
                this.voteMinimum = updatedProposal.voteMinimum || proposal.voteMinimum
            }

            // await ProposalModel.updateOne({"caseNumber": updatedProposal.caseNumber}, this as Proposal)
            await this.saveCase()
            updateComplete = true
        }
        catch (err) {
            errorLogger("Proposal.update()", err)           
        }
        return updateComplete
    }

    public async addVote(vote: Vote): Promise<boolean> {
        let added: boolean = false
        try {
            if ( vote.caseNumber === this.caseNumber ) {
                this.votes.push(vote)
                added = true
                await this.saveCase()
            }
        }
        catch (err) {
            errorLogger("Proposals.addVote()", err)
        }
        return added
    }
}

