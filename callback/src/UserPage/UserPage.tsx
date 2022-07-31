import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { getUser } from "../serviceCalls/getUser";
import { getBalances } from "../serviceCalls/getBalances";
import styles from "./UserPage.module.scss";


export const UserPage: React.FC = () => {
    const user = useUser()
    const loggedIn = useIsLoggedIn()
    const [ active, setActive ] = useState<number>(0)
    const [ oreIdBalance, setOreIdBalance ] = useState<number>(0)
    const [ discordId, setDiscordId ] = useState<string>("Not Linked")
    // const [ oreId, setOreId ]

    const fetchData = async() => {
        const userData = await getUser((user?.accountName || "None"), "oreid")
        if (userData.discordId) {
            setDiscordId(userData.discordId)
        }
        
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
        <section className={styles.UserPage}>
            <div className={styles.firstbox} >
                <section className={styles.Balance}>
                    <div className={styles.card} >
                        <h3>Active Balance:<br />{active} ORE</h3>
                        <h3>ORE-ID Balance | {user?.accountName}<br />{oreIdBalance} ORE</h3>
                    </div>
                </section>
            </div>
            <div className={styles.content}>
                <h3>DiscordId Linked:<br /> {discordId}</h3>
            </div>
        </section>
    )
}