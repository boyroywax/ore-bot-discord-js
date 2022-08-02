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
    const loggedIn = useIsLoggedIn()
    const [ active, setActive ] = useState<number>(0)
    const [ oreIdBalance, setOreIdBalance ] = useState<number>(0)
    const [ balances, setBalances] = useState<boolean>(false)
    const [ discordId, setDiscordId ] = useState<string | null>(null)
    const [ logEntries, setLogEntries ] = useState<any[] | null>(null)
    const [ loadedEntries, setLoadedEntries ] = useState<boolean>(false)
    const [ totalTips, setTotaltips ] = useState<number | null>(null)

    let log: any = "Loading Activity..."

    const getDiscordId = async () => {
        const userData = await getUser((user?.accountName || "None"), "oreid")
        if (userData.discordId) {
            setDiscordId(userData.discordId)
        }
    }

    const fetchData = async ( discordId: bigint ) => {
        const balance = await getBalances(discordId)
        setActive(Number(balance.activeBalance))
        setOreIdBalance(Number(balance.oreIdBalance))
        setBalances(true)
    }

    const loadEntries = async (discordId: bigint) => {
        const logEntries = await getActivity(discordId)
        log = logEntries.map(
            (item: any) => {return (<li key={item._id}>{item.action} | {item.status}</li>)}
        )
        setLogEntries(log.slice(0,10))
        setLoadedEntries(true)
    } 

    const getUserTips = async (discordId: bigint) => {
        const userTotalTips = await getTips(discordId, "total")
        setTotaltips( userTotalTips.result )    
    }

    useEffect(() => {
        if ((loggedIn) && (user !== undefined) && (discordId === null)) {
            getDiscordId()
        }
        if ((loggedIn) && (user !== undefined) && (discordId !== null) && (!balances)) {
            fetchData(BigInt(discordId))
        }
        if ((totalTips === null) && (user !== undefined) && (discordId !== null)) {
            getUserTips(BigInt(discordId))
        }
        if ((discordId !== null) && (user !== undefined) && (loadedEntries === false)) {
            loadEntries(BigInt(discordId))
        }
        return
    })


    // useEffect(() => {

    //     if (user !== undefined) { 
    //         const discordUserData = new DiscordUserData(user)

    //         discordUserData.loadUserData()
    //         setDiscordId(discordUserData.discordId.toString())
    //         setActive(Number(discordUserData.activeBalance))
    //         setOreIdBalance(Number(discordUserData.oreIdBalance))

    //         const log = discordUserData.logEntries.map(
    //             (item: any) => {return (<li key={item._id}>{item.action} | {item.status}</li>)}
    //         )
    //         const logSlice = log.slice(0,10)
    //         setLogEntries(logSlice)
    //         setTotaltips( discordUserData.tipCount )
    //         setLoadedEntries(true)
    //     }
    // }, [user])

    // if (!loadedEntries) {
    //     return <>..Loading</>
    // }

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