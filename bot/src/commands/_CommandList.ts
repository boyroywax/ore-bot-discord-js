import { CommandInt } from "../interfaces/CommandInt"
import { activity } from "./activity"
import { balance } from './balance'
import { block } from "./block"
import { deposit } from "./deposit"
import { donate } from './faucet-donate'
import { drip } from "./faucet-drip"
import { help } from "./help"
import { login } from "./login"
import { logout } from './logout'
import { price } from './price'
import { tip } from './tip'
import { transfer } from "./transfer"
import { withdraw } from "./withdraw"
import { treasurybal } from './treasury-balance'
import { createacct } from './treasury-createAcct'
import { addperm } from './treasury-addPerm'
import { buyRamByte } from "./treasury-buyram"
import { delegateBW } from "./treasury-stakeResources"
import { callservice } from "./callservice"

const AdminCommandList: CommandInt[] = [
    treasurybal,
    createacct,
    addperm,
    buyRamByte,
    delegateBW,
    transfer,
    withdraw
]

const UserCommandList: CommandInt[] = [ 
    activity,
    balance,
    block,
    callservice,
    deposit,
    donate,
    drip,
    help,
    login,
    logout,
    price,
    tip
]


let WorkingCommandList: CommandInt[] = []
WorkingCommandList.push( ...UserCommandList )

if ( process.env.BOT_ADMIN_MODE == "true" ) {
    WorkingCommandList.push( ...AdminCommandList )
}

export const CommandList = WorkingCommandList