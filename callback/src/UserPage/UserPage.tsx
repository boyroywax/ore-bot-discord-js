import { useOreId, useIsLoggedIn, useUser } from "oreid-react";
import React, { useEffect, useState } from "react";
import { getUser } from "../serviceCalls/getUser";
import { getBalances } from "../serviceCalls/getBalances";
import styles from "./UserPage.module.scss";
import { getActivity } from "../serviceCalls/getActivity";
import { getTips } from "../serviceCalls/getTips"
import { DiscordUserData } from "./LoadUserPage";


export const UserPage: React.FC = () => {
    const user = useUser()
    const loggedIn = useIsLoggedIn() || false
    const [ userData, setUserData ] = useState<{
        activeBalance: null | number, 
        oreIdBalance: null | number,
        discordId: null | string,
        logEntries: null | any[],
        totalTips: null | number
    }>({
        activeBalance: null, 
        oreIdBalance: null,
        discordId: null,
        logEntries: null,
        totalTips: null
    })
    const [ discordId, setDiscordId ] = useState<string | null>(null)
    const [ loadedEntries, setLoadedEntries ] = useState<boolean>(false)

    const getDiscordId = async () => {
        const userData = await getUser((user?.accountName || "None"), "oreid")
        if (userData.discordId) {
            setDiscordId(userData.discordId)
        }
    }

    const fetchData = async ( discordId: bigint ) => {
        const balance = await getBalances(discordId)

        const logEntries = await getActivity(discordId)
        const log = logEntries.map(
            (item: any) => {return (<li key={item._id}>{item.action} | {item.status}</li>)}
        )

        const userTotalTips = await getTips(discordId, "total")

        setUserData({
            activeBalance: Number(balance.activeBalance),
            oreIdBalance: Number(balance.oreIdBalance),
            discordId: discordId.toString(),
            logEntries: log.slice(0,10),
            totalTips: Number(userTotalTips.result)
        })
        setLoadedEntries(true)
    }

    useEffect(() => {
        if ((loggedIn) && (user !== undefined) && (discordId === null)) {
            getDiscordId()
        }
        else if ((loggedIn) && (user !== undefined) && (discordId !== null) && !loadedEntries) {
            fetchData(BigInt(discordId))
            return
        }
        else if((loggedIn) && (user !== undefined) && loadedEntries ){
            return
        }
        else if (!loggedIn || user === undefined){
            return
        }
        else {
            return
        }
        return
    })

    return (
        <section className={styles.UserPage}>
            <div className={styles.firstbox} >
                <section className={styles.Balance}>
                    <div className={styles.card} >
                        <h3>Active Balance:<br />{userData.activeBalance} ORE</h3>
                        <h3>ORE-ID Balance | {user?.accountName}<br />{userData.oreIdBalance} ORE</h3>
                        <h3>DiscordId Linked:<br /> {userData.discordId}</h3>
                        <h3>Total Tips:<br />{userData.totalTips}</h3>
                    </div>
                    <div className={styles.card} >
                        { loadedEntries ? 
                        <ol>
                            {userData.logEntries}
                        </ol>
                        : "Loading Activity..." }
                    </div>
                </section>
            </div>
        </section>
    )
}