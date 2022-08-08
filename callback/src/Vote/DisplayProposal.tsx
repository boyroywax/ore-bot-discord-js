import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import useUrlState from "@ahooksjs/use-url-state";

interface Props {
    caseNum: number | null
}

export const DisplayProposal: React.FC<Props> = ({
    caseNum
}) => {
    return (
        <>
            <h3>Case { caseNum }</h3>
        </>
    )
}