import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import { createProposal } from "../serviceCalls/createProposal";
import { getNextNewCase } from "../serviceCalls/getNextNewCase";

interface Props {
    user: UserData | null
}

export const CreateProposal: React.FC<Props> = ({
    user
}) => {
    const [state, setState] = useState<{
        title: string,
        creator: string,
        endDate: Date,
        proposed: string,

    }>({
        title: "Add Title",
        creator: user?.accountName || "None",
        endDate: new Date,
        proposed: "Add Proposal"

    })

    const handleChange = (event: any) => {
        if (event.target.name === "title") {
            setState({
                title: event.target.value,
                creator: state.creator,
                endDate: state.endDate,
                proposed: state.proposed
            })
        }
        else if (event.target.name === "proposal") {
            setState({
                title: state.title,
                creator: state.creator,
                endDate: state.endDate,
                proposed: event.target.value
            })
        }
    }

    const handleSubmit = async (event: any) => {
        const nextCaseNum = (await getNextNewCase()).nextcase
        await createProposal({
            dateCreated: new Date,
            caseNumber: nextCaseNum,
            title: state.title,
            creator: state.creator,
            proposed: state.proposed,
            selections: ["Agree", "Disagree"],
            changeVote: false,
            endDate: state.endDate,
            status: "New",
            voteThreshold: 50.00,
            voteMinimum: 100.00
        })
    }
    return (
        <>
            <form onSubmit={handleSubmit}>
                <label>
                    Title
                    <textarea value={state.title} onChange={handleChange} name="title" />
                </label><br />
                <label>
                    Proposal <br />
                    <textarea value={state.proposed} onChange={handleChange} name="proposal" />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </>
    )
}