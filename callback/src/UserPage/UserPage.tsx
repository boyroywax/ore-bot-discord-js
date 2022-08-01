import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { getUser } from "../serviceCalls/getUser";
import { getBalances } from "../serviceCalls/getBalances";
import styles from "./UserPage.module.scss";
import { getActivity } from "../serviceCalls/getActivity";
import { getTips } from "../serviceCalls/getTips"


export const UserPage: React.FC = () => {
    const user = useUser()
    const loggedIn = useIsLoggedIn()
    const [ active, setActive ] = useState<number>(0)
    const [ oreIdBalance, setOreIdBalance ] = useState<number>(0)
    const [ discordId, setDiscordId ] = useState<string>("Not Linked")
    const [ logEntries, setLogEntries ] = useState()
    const [ loadedEntries, setLoadedEntries ] = useState<boolean>(false)
    const [ totalTips, setTotaltips ] = useState<number>(0)

    let log: any = "Loading Activity..."

    const fetchData = async() => {
        const userData = await getUser((user?.accountName || "None"), "oreid")

        if (userData.discordId) {
            setDiscordId(userData.discordId)
        }
        if (userData.discordId && !loadedEntries) {
            const logEntries = await getActivity(userData.discordId)
            log = logEntries.map(
                (item: any) => {return (<li key={item._id}>{item.action}</li>)}
            )
            setLogEntries(log)
            const userTotalTips = await getTips(userData.discordId, "total")
            setTotaltips( userTotalTips.result )

            setLoadedEntries(true)
        }
        
        const balances = await getBalances(BigInt(userData.discordId) || BigInt(0))
        setActive(Number(balances.activeBalance))
        setOreIdBalance(Number(balances.oreIdBalance))
    }

    useEffect(() => {
        if ((loggedIn) && (user) && (!loadedEntries)) {
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
                        <h3>DiscordId Linked:<br /> {discordId}</h3>
                        <h3>Total Tips:<br />{totalTips}</h3>
                    </div>
                    <div className={styles.card} >
                        { loadedEntries ? 
                        <ol>
                            {logEntries}
                        </ol>
                        : "Loading Activity..." }
                    </div>
                </section>
            </div>
        </section>
    )
}