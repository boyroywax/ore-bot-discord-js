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


export const CommandList: CommandInt[] = [ 
    activity,
    balance,
    block,
    deposit,
    donate,
    drip,
    help,
    login,
    logout,
    price,
    tip,
    transfer,
    withdraw,
    treasurybal,
    createacct,
    addperm,
    buyRamByte
]