import React, { useEffect, useState } from "react";
import { UserData } from "oreid-js";
import useUrlState from "@ahooksjs/use-url-state";
import { CreateProposal } from "./CreateProposal";
import { DisplayProposal } from "./DisplayProposal";
import { getNextNewCase } from "src/serviceCalls/getNextNewCase";

interface Props {
    user: UserData | null | undefined
}

export const Proposals: React.FC<Props> = ({
    user
}) => {
    const [ state, setUrlState ] = useUrlState<{
        proposal: string,
        maxCaseNum: null | number
    }>({
        proposal: "1",
        maxCaseNum: null
    })
    
    const [ buttons, setButtons ] = useState<null | any[]>(null)

    const onProposalClick = (e: any) => {
        e.preventDefault()
        setUrlState({ 
            proposal: e.target.value,
            maxCaseNum: state.maxCaseNum
        })
    }

    const getNextCaseNum = async () => {
        const maxCase: number = (await getNextNewCase()).nextcase
        setUrlState({
            proposal: state.proposal,
            maxCaseNum: maxCase
        })
    }

    useEffect(() => {
        if (buttons === null) {
            getNextCaseNum().then(() => {
                let buttonMap = []
                for (let i:number = 1; i < state.maxCaseNum; i++ ) {
                    buttonMap.push(i)
                }
                const buttons = buttonMap.map(
                    (item: any) => {
                        return (
                            <button
                                value={item}
                                onClick={(e) =>
                                    onProposalClick(e)
                                }
                            >Proposal #{item}</button>
                        )
                    }
                )
                setButtons(buttons)
            })
        }
        
    })

    return (
        <>
         <button
            value="0"
            onClick={(e) =>
                onProposalClick(e)
            }
        >Create Proposal</button>
        {buttons}

        { state.proposal === "0" ? 
            <CreateProposal user={user}/>
        :
            // () => null 
            <DisplayProposal />
        }
        </>
    )
}