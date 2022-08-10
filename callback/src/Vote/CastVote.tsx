import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import useUrlState from "@ahooksjs/use-url-state";
import { Proposals } from "./Proposals";
import { DisplayProposal } from "./DisplayProposal";
import { useUser } from "oreid-react";

interface Props {
    user: UserData | null
}

export const CastVote: React.FC<Props> = ({
    user
}) => {
    return (
        <>
        <Proposals user={user} />
        {/* <DisplayProposal /> */}
        </>
    )
}