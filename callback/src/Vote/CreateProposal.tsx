import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";

interface Props {
    user: UserData | null
}

export const CreateProposal: React.FC<Props> = ({
    user
}) => {
    return (
        <>
            <form>
                <label>
                    Title:
                    <input type="text" name="title" />
                </label>
                <label>
                    Proposal:
                    <input type="text" name="proposal" />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </>
    )
}