import { CommandInt } from "../interfaces/CommandInt"
import { activity } from "./activity"
import { balance } from './balance'
import { donate } from './faucet-donate'
import { drip } from "./faucet-drip"
import { help } from "./help"
import { login } from "./login"
import { logout } from './logout'
import { price } from './price'
import { tip } from './tip'
import { treasurybal } from './treasury-balance'
import { createacct } from './treasury-createAcct'
import { addperm } from './treasury-addPerm'
import { buyRamByte } from "./treasury-buyram"


export const CommandList: CommandInt[] = [ 
    activity,
    balance,
    donate,
    drip,
    help,
    login,
    logout,
    price,
    tip,
    treasurybal,
    createacct,
    addperm,
    buyRamByte
]