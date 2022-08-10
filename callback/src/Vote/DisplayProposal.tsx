import React, { useEffect, useState } from "react";
// import { UserData } from "oreid-js";
import useUrlState from "@ahooksjs/use-url-state";
import { getProposal } from "src/serviceCalls/getProposal";
// import { CastVote } from "./CastVote";

// interface Props {
//     case: number | null
//     // user: UserData | null
// }

export const DisplayProposal: React.FC = () => {
    const [ state, setState ] = useUrlState<{
        proposal: string,
    }>()
    const [ proposal, setProposal ] = useState<{
        dateCreated: null | Date,
        caseNumber: null | number,
        title: null | string,
        creator: null | bigint | string,
        proposed: null | string,
        // selections: string[],
        changeVote: null | boolean,
        endDate: null | Date,
        status: null | string,
        voteThreshold: null | number,
        voteMinimum: null | number,
        // votes: any[]
    }>({
        // dateCreated: new Date,
        // caseNumber: 0,
        // title: "None",
        // creator: "None",
        // proposed: "None",
        // // selections: ["Agree", "Disagree"],
        // changeVote: false,
        // endDate: new Date,
        // status: "Initializing",
        // voteThreshold: 0.00,
        // voteMinimum: 0.00,
        // votes: [{}]
        dateCreated: null,
        caseNumber: null,
        title: null,
        creator: null,
        proposed: null,
        // selections: ["Agree", "Disagree"],
        changeVote: null,
        endDate: null,
        status: "Initializing",
        voteThreshold: null,
        voteMinimum: null,
    })

    const fetchProposal = async() => {
        const proposalData = await getProposal( Number(state.proposal) || 1 )
        setProposal({
            dateCreated: proposalData.dateCreated,
            caseNumber: proposalData.caseNumber,
            title: proposalData.title,
            creator: proposalData.creator || "None",
            proposed: proposalData.proposed,
            // selections: ["Agree", "Disagree"],
            changeVote: proposalData.changeVote,
            endDate: proposalData.endDate,
            status: proposalData.status,
            voteThreshold: proposalData.voteThreshold,
            voteMinimum: proposalData.voteMinimum,
        })
    }

    useEffect(() => {
        if (proposal.title === null) {
            fetchProposal().then(() => console.log("Proposal #" + state.proposal))
        }
    })

    return (
        <>
            <h3>Case { state.proposal }</h3>
            <ul>
                <li>Title: {proposal.title} </li>
                <li>Created: {proposal.dateCreated} </li>
                <li>Case Number: {proposal.caseNumber} </li>
                <li>Creator: {proposal.creator} </li>
                <li>Proposed: {proposal.proposed} </li>
                <li>Change Vote: {proposal.changeVote} </li>
                <li>End Date: {proposal.endDate} </li>
                <li>Status: {proposal.status} </li>
                <li>Vote Threshold: {proposal.voteThreshold} </li>
                <li>Vote Minimum: {proposal.voteMinimum} </li>
            </ul>
        </>
    )
}