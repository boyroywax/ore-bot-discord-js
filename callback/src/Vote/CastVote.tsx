import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import useUrlState from "@ahooksjs/use-url-state";
import { Proposals } from "./Proposals";
import { DisplayProposal } from "./DisplayProposal";

interface Props {
    user: UserData | null
}

export const CastVote: React.FC<Props> = ({
    user
}) => {
    const [ state, setUrlState ] = useUrlState<{
        proposal: string,
        vote: string
    }>({
        proposal: "None",
        vote: "None"
    })



    return (
        <>
        <Proposals user={user} />
        <DisplayProposal />
        </>
    )
}