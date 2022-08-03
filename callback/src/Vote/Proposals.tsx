import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import useUrlState from "@ahooksjs/use-url-state";

interface Props {
    user: UserData | null
}

export const Proposals: React.FC<Props> = ({
    user
}) => {
    const [ state, setUrlState ] = useUrlState<{
        proposal: string,
    }>({
        proposal: "None",
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
        >Proposal #1</button>
        </>
    )
}