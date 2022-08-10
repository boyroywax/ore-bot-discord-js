import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import useUrlState from "@ahooksjs/use-url-state";
import { CreateProposal } from "./CreateProposal";
import { DisplayProposal } from "./DisplayProposal";

interface Props {
    user: UserData | null | undefined
}

export const Proposals: React.FC<Props> = ({
    user
}) => {
    const [ state, setUrlState ] = useUrlState<{
        proposal: string,
    }>({
        proposal: "1",
    })

    const onProposalClick = (e: any) => {
        e.preventDefault()
        setUrlState({ proposal: e.target.value })
    }

    return (
        <>
        <button
            value="1"
            onClick={(e) =>
                onProposalClick(e)
            }
        >Proposal #1</button> <button
            value="0"
            onClick={(e) =>
                onProposalClick(e)
            }
        >Create Proposal</button>

        { state.proposal === "0" ? 
            <CreateProposal user={user}/>
        :
            // () => null 
            <DisplayProposal />
        }
        </>
    )
}