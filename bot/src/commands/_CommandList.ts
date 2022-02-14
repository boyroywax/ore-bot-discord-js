import { CommandInt } from "../interfaces/CommandInt"
import { balance } from './balance'
import { help } from "./help"
import { login } from "./login"
import { logout } from './logout'
import { tip } from './tip'

export const CommandList: CommandInt[] = [ balance, help, login, logout, tip ];