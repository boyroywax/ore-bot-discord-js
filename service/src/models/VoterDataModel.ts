import mongoose, { Schema, model } from "mongoose"

import { Docket, Proposal, Vote } from "../interfaces/VoterData"


export const voteSchema = new Schema<Vote>({
    discordId: { type: Schema.Types.Long || String , required: true },
    oreId: { type: String, required: true },
    balanceAtVote: { type: Number, required: true },
    voteSelection: { type: [String], required: true },
    dateVoted: { type: Date, required: true },
    caseNumber: { type: Number, required: true },
    voteWeight: { type: Number, required: true },
})

export const VoteModel = model<Vote>("Vote", voteSchema)

export const proposalSchema = new Schema<Proposal>({
    // id?: number
    dateCreated: { type: Date, required: true },
    caseNumber: { type: Number, required: true },
    title: { type: String, required: true },
    creator: { type: Schema.Types.Long || String , required: true },
    proposed: { type: String, required: true },
    selections: { type: [String], required: true },
    changeVote: { type: Boolean, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, required: true },
    voteThreshold: { type: Number, required: true },
    voteMinimum: {type: Number, required: true },
    votes: { type: [voteSchema], required: true }
})

export const ProposalModel = model<Proposal>("Proposal", proposalSchema)

export const docketSchema = new Schema<Docket>({
    dateCreated: { type: Date, required: true },
    creator: { type: Schema.Types.Long || String, required: true },
    docketNumber: { type: Number, required: true },
    proposals: {type: [proposalSchema], required: true },
    status: { type: String, required: true },
    endDate: { type: Date, required: true }
})

export const DocketModel = model<Docket>("Docket", docketSchema)