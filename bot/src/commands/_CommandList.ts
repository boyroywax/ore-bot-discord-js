import { CommandInt } from "../interfaces/CommandInt"
import { activity } from "./activity"
import { balance } from './balance'
import { donate } from './faucet-donate'
import { drip } from "./faucet-drip"
import { help } from "./help"
import { login } from "./login"
import { logout } from './logout'
import { tip } from './tip'


export const CommandList: CommandInt[] = [ 
    activity,
    balance,
    donate,
    drip,
    help,
    login,
    logout,
    tip 
]