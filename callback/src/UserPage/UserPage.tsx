import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { getUser } from "../serviceCalls/getUser";
import { getBalances } from "../serviceCalls/getBalances";


export const UserPage: React.FC = () => {
    const user = useUser()
    const loggedIn = useIsLoggedIn()
    const [ active, setActive ] = useState<number>(0)
    const [ oreIdBalance, setOreIdBalance ] = useState<number>(0)
    // const [ oreId, setOreId ]

    const fetchData = async() => {
        const userData = await getUser((user?.accountName || "None"), "oreid")
        
        const balances = await getBalances(BigInt(userData.discordId) || BigInt(0))
        setActive(Number(balances.activeBalance))
        setOreIdBalance(Number(balances.oreIdBalance))
    }

    useEffect(() => {
        if ((loggedIn) && (user)) {
            fetchData()
            return
        }
    })

    return (
        <section>
            <div>
                <h3>Active Balance:<br />{active} ORE</h3>
                <h3>ORE-ID Balance | {user?.accountName}<br />{oreIdBalance} ORE</h3>
            </div>
        </section>
    )
}