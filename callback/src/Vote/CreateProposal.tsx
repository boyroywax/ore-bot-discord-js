import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import { createProposal } from "../serviceCalls/createProposal";
import { getNextNewCase } from "../serviceCalls/getNextNewCase";

interface Props {
    user: UserData | null | undefined
}

export const CreateProposal: React.FC<Props> = ({
    user
}) => {
    const [state, setState] = useState<{
        title: string,
        creator: string,
        endDate: Date,
        proposed: string,
        nextcase: null | number

    }>({
        title: "Add Title",
        creator: user?.accountName || "None",
        endDate: new Date,
        proposed: "Add Proposal",
        nextcase: null

    })

    const getNextCaseNum = async () => {
        const nextCase: number = (await getNextNewCase()).nextcase
        setState({
            title: state.title,
            creator: state.creator,
            endDate: state.endDate,
            proposed: state.proposed,
            nextcase: nextCase
        })
    }

    const handleChange = (event: any) => {
        if (event.target.name === "title") {
            setState({
                title: event.target.value,
                creator: state.creator,
                endDate: state.endDate,
                proposed: state.proposed,
                nextcase: state.nextcase
            })
        }
        else if (event.target.name === "proposal") {
            setState({
                title: state.title,
                creator: state.creator,
                endDate: state.endDate,
                proposed: event.target.value,
                nextcase: state.nextcase
            })
        }
    }

    const handleSubmit = async (event: any) => {
        await createProposal({
            dateCreated: new Date,
            caseNumber: state.nextcase || 1,
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

    useEffect(() => {
        if (state.nextcase === null) {
            getNextCaseNum()
        }
    })
    return (
        <>
            <form onSubmit={handleSubmit}>
                <label>
                    Title <br />
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