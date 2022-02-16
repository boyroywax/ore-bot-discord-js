import { CommandInt } from "../interfaces/CommandInt"
import { balance } from './balance'
import { help } from "./help"
import { login } from "./login"
import { logout } from './logout'
import { tip } from './tip'
// import { tipAdmin } from './tipAdmin'
import { activity } from "./activity"

export const CommandList: CommandInt[] = [ activity, balance, help, login, logout, tip ];