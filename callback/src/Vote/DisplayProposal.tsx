import React, { useEffect, useState } from "react";
import useUrlState from "@ahooksjs/use-url-state";
import { getProposal } from "../serviceCalls/getProposal";
import { deleteCase } from "../serviceCalls/deleteCase";


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
        fetched: null | boolean
        ready: null | boolean
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
        fetched: false,
        ready: true
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
            fetched: true,
            ready: true
        })

    }

    useEffect(() => {
        // fetchProposal()
        console.log("propose.caseNumer: " + proposal.caseNumber + " state.proposal: " + state.proposal)
        if (state.proposal != proposal.caseNumber) {
            fetchProposal().then(() => console.log("Proposal #" + state.proposal))
        }
    })

    const deleteCaseNumber = async () => {
        await deleteCase(state.proposal)
    }

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
            <button
                onClick = {deleteCaseNumber}
            > Delete This Case </button>

        </>
    )
}